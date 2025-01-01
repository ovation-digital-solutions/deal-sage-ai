'use client';
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { toast } from 'react-hot-toast';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatState = {
  [analysisId: string]: ChatMessage[];
};

type LoadingState = {
  [analysisId: string]: boolean;
};

type InputState = {
  [analysisId: string]: string;
};

type Analysis = {
  properties: Property[];
  analysis: string;
  id: string;
};

export default function ComparePage() {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('analyses');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure each analysis has an id
        return parsed.map((analysis: Analysis) => ({
          ...analysis,
          id: analysis.id || Date.now().toString()
        }));
      }
      return [];
    }
    return [];
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chats, setChats] = useState<ChatState>({});
  const [chatInput, setChatInput] = useState<InputState>({});
  const [loadingChats, setLoadingChats] = useState<LoadingState>({});

  // Add useEffect for analyses
  useEffect(() => {
    if (analyses.length > 0) {
      sessionStorage.setItem('analyses', JSON.stringify(analyses));
    }
  }, [analyses]);

  useEffect(() => {
    const loadSelectedProperties = () => {
      const saved = localStorage.getItem('selectedProperties');
      if (saved) {
        setSelectedProperties(JSON.parse(saved));
      }
    };
    loadSelectedProperties();
  }, []);

  // Load all saved chats once when component mounts
  useEffect(() => {
    const savedChats = localStorage.getItem('propertyChats');
    if (savedChats) {
      setChats(JSON.parse(savedChats));
    }
  }, []);

  const handleDelete = async (propertyId: string) => {
    const updatedProperties = selectedProperties.filter(p => p.id !== propertyId);
    setSelectedProperties(updatedProperties);
    // Update localStorage
    localStorage.setItem('selectedProperties', JSON.stringify(updatedProperties));
    toast.success('Property removed from comparison');
  };

  const handleCompareProperties = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: selectedProperties }),
      });

      if (!response.ok) throw new Error('Comparison failed');
      const data = await response.json();
      
      // Add new analysis to the beginning of the array with a smaller ID
      setAnalyses(prev => [{
        properties: [...selectedProperties],
        analysis: data.analysis,
        id: Math.floor(Math.random() * 1000000).toString() // Use smaller numbers that PostgreSQL can handle
      }, ...prev]);
      
      toast.success('Properties compared successfully');
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Failed to compare properties');
    } finally {
      setIsAnalyzing(false);
    }
  };

  

  const handleSaveToFavorites = async (property: Property) => {
    try {
      const response = await fetch('/api/properties/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: property.id,
          address: property.address,
          price: property.price,
          photoUrl: property.photoUrl,
          propertyDetails: property.propertyDetails,
          sqft: property.sqft
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to favorites');
      }

      toast.success(`${property.address} saved to favorites`);
    } catch (error) {
      console.error('Save to favorites error:', error);
      toast.error('Failed to save to favorites');
    }
  };

  const handleClearAll = () => {
    setSelectedProperties([]);
    localStorage.removeItem('selectedProperties');
    sessionStorage.removeItem('currentComparison');
    toast.success('All properties cleared from comparison');
  };

  const handleSaveToAnalyses = async (item: Analysis) => {
    try {
      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: item.properties.map(property => ({
            id: property.id,
            address: property.address,
            price: property.price,
            image_url: property.photoUrl,
          })),
          analysisText: item.analysis
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }

      toast.success('Analysis saved successfully');
    } catch (error) {
      console.error('Save analysis error:', error);
      toast.error('Failed to save analysis');
    }
  };

  const handleChatSubmit = async (e: React.FormEvent, analysisId: string, analysis: { analysis: string; properties: Property[] }) => {
    e.preventDefault();
    if (!chatInput[analysisId]?.trim() || loadingChats[analysisId]) return;

    const userMessage = chatInput[analysisId].trim();
    setChatInput(prev => ({ ...prev, [analysisId]: '' }));
    
    const newMessages: ChatMessage[] = [
      ...(chats[analysisId] || []),
      { role: 'user', content: userMessage }
    ];

    setChats(prev => {
      const updated = { ...prev, [analysisId]: newMessages };
      localStorage.setItem('propertyChats', JSON.stringify(updated));
      return updated;
    });
    
    setLoadingChats(prev => ({ ...prev, [analysisId]: true }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: analysis.analysis,
          properties: analysis.properties
        }),
      });

      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();
      
      setChats(prev => {
        const updated = {
          ...prev,
          [analysisId]: [...newMessages, { role: 'assistant' as const, content: data.response }]
        };
        localStorage.setItem('propertyChats', JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get response');
    } finally {
      setLoadingChats(prev => ({ ...prev, [analysisId]: false }));
    }
  };

  const clearChat = (analysisId: string) => {
    setChats(prev => {
      const updated = { ...prev };
      delete updated[analysisId];
      localStorage.setItem('propertyChats', JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteAnalysis = (analysisId: string) => {
    // Remove the analysis from state
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== analysisId);
    setAnalyses(updatedAnalyses);
    
    // Update session storage
    if (updatedAnalyses.length === 0) {
      sessionStorage.removeItem('analyses');
    } else {
      sessionStorage.setItem('analyses', JSON.stringify(updatedAnalyses));
    }
    
    toast.success('Analysis deleted successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 xs:py-8 space-y-6 xs:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl xs:text-2xl font-bold text-gray-900">Compare Properties</h1>
          <p className="mt-1 text-sm text-gray-500">
            Select multiple properties to compare their features
          </p>
        </div>
        <div className="flex flex-col xs:flex-row gap-3">
          {selectedProperties.length > 0 && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center justify-center
                px-6 py-2.5 rounded-lg text-gray-700 text-sm font-medium
                border border-gray-300 bg-white
                hover:bg-gray-50 hover:shadow-sm
                transition-all duration-200 ease-in-out"
            >
              Clear All
            </button>
          )}
          <button
            onClick={handleCompareProperties}
            disabled={selectedProperties.length < 2 || isAnalyzing}
            className={`
              inline-flex items-center justify-center
              px-6 py-2.5 rounded-lg text-white text-sm font-medium
              shadow-sm transition-all duration-200 ease-in-out
              ${selectedProperties.length < 2 || isAnalyzing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 hover:shadow-md active:transform active:scale-[0.98]'
              }
            `}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                Compare {selectedProperties.length} Properties
                {selectedProperties.length < 2 && <span className="ml-2 text-xs opacity-75">(Select at least 2)</span>}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Properties Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
        {selectedProperties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onDelete={handleDelete}
            showDeleteButton={true}
          />
        ))}
      </div>

      {/* All Analyses */}
      <div className="space-y-6">
        {analyses.map((analysis, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-3 xs:p-4 sm:p-6 space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4">
              <h2 className="text-lg xs:text-xl font-semibold">Analysis Results</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSaveToAnalyses(analysis)}
                  className="px-4 py-2 text-sm bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Save Analysis
                </button>
                <button
                  onClick={() => handleDeleteAnalysis(analysis.id)}
                  className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete Analysis
                </button>
              </div>
            </div>
            
            {/* Properties Grid with Save to Favorites */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
              {analysis.properties.map(property => (
                <div key={property.id} className="relative">
                  <PropertyCard
                    property={property}
                    showDeleteButton={false}
                  />
                  <button
                    onClick={() => handleSaveToFavorites(property)}
                    className="mt-2 w-full px-4 py-2 text-sm bg-green-50 text-green-600 
                             rounded-lg hover:bg-green-100 transition-colors
                             flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Save to Favorites
                  </button>
                </div>
              ))}
            </div>

            {/* Analysis Text */}
            <div className="prose max-w-none text-sm xs:text-base">
              {analysis.analysis.split('\n').map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-3">{paragraph}</p>
              ))}
            </div>

            {/* Chat Interface */}
            <div className="mt-4 sm:mt-6 border-t pt-4">
              <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold">Chat about this Analysis</h3>
                <button
                  onClick={() => clearChat(analysis.id)}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear Chat
                </button>
              </div>
              
              {/* Chat Messages */}
              <div className="space-y-3 mb-4 max-h-[300px] xs:max-h-[400px] overflow-y-auto px-2">
                {(chats[analysis.id] || []).map((message, i) => (
                  <div
                    key={i}
                    className={`p-2 xs:p-3 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gray-100 ml-auto max-w-[85%] sm:max-w-[75%]'
                        : 'bg-blue-50 mr-auto max-w-[85%] sm:max-w-[75%]'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm sm:text-base">{message.content}</p>
                    ) : (
                      <ul className="space-y-2 list-none text-sm sm:text-base">
                        {message.content.split('\n').map((point, index) => (
                          point.trim() && (
                            <li key={index} className="flex items-start gap-3">
                              <span className="text-gray-400 flex-shrink-0">•</span>
                              <span>{point.replace(/^[•\-]\s*/, '')}</span>
                            </li>
                          )
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => handleChatSubmit(e, analysis.id, analysis)} 
                className="flex flex-col xs:flex-row gap-2"
              >
                <input
                  type="text"
                  value={chatInput[analysis.id] || ''}
                  onChange={(e) => setChatInput(prev => ({
                    ...prev,
                    [analysis.id]: e.target.value
                  }))}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 text-sm sm:text-base border rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loadingChats[analysis.id]}
                />
                <button
                  type="submit"
                  disabled={loadingChats[analysis.id]}
                  className={`px-4 py-2 rounded-lg text-white text-sm sm:text-base 
                             whitespace-nowrap ${
                    loadingChats[analysis.id]
                      ? 'bg-gray-400'
                      : 'bg-black hover:bg-gray-800'
                  }`}
                >
                  {loadingChats[analysis.id] ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Sending
                    </span>
                  ) : 'Send'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
