'use client';
import { useState, useEffect, useRef } from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { toast } from 'react-hot-toast';
import { PropertyCarousel } from '@/components/PropertyCarousel';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const userId = user?.id;

  const [selectedProperties, setSelectedProperties] = useState<Property[]>(() => {
    if (typeof window !== 'undefined' && userId) {
      const saved = localStorage.getItem(`selectedProperties_${userId}`);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  const [analyses, setAnalyses] = useState<Analysis[]>(() => {
    if (typeof window !== 'undefined' && userId) {
      const saved = sessionStorage.getItem(`analyses_${userId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((analysis: Analysis) => ({
          ...analysis,
          id: analysis.id || Date.now().toString()
        }));
      }
    }
    return [];
  });
  const [isAnalyzing] = useState(false); // Removed unused setter
  const [chats, setChats] = useState<ChatState>({});
  const [chatInput, setChatInput] = useState<InputState>({});
  const [loadingChats, setLoadingChats] = useState<LoadingState>({});
  const [collapsedAnalyses, setCollapsedAnalyses] = useState<{ [key: string]: boolean }>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('collapsedAnalyses');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [isComparingPortfolio, setIsComparingPortfolio] = useState<{ [key: string]: boolean }>({});

  // Add ref for chat container
  const chatContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    Object.entries(chats).forEach(([analysisId, messages]) => {
      const container = chatContainerRefs.current[analysisId];
      if (container && messages.length > 0) {
        // Get all message elements in the container
        const messageElements = container.querySelectorAll('[data-message]');
        // Get the last response message
        const lastResponse = Array.from(messageElements).findLast(
          el => el.getAttribute('data-role') === 'assistant'
        );
        
        if (lastResponse) {
          // Use 'nearest' instead of 'start' to prevent over-scrolling
          lastResponse.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  }, [chats]);

  // Add useEffect for analyses
  useEffect(() => {
    if (analyses.length > 0 && userId) {
      sessionStorage.setItem(`analyses_${userId}`, JSON.stringify(analyses));
    }
  }, [analyses, userId]);

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
    // Update localStorage with user-specific key
    if (userId) {
      localStorage.setItem(`selectedProperties_${userId}`, JSON.stringify(updatedProperties));
    }
    toast.success('Property removed from comparison');
  };

  const handleCompareProperties = async (properties: Property[]) => {
    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Redirect to upgrade page if limit is reached
          window.location.href = '/dashboard/upgrade';
          return;
        }
        throw new Error(data.error || 'Comparison failed');
      }

      // Your existing success handling code...
      const analysisResult = data.analysis;
      setAnalyses(prev => [{
        properties: [...selectedProperties],
        analysis: analysisResult,
        id: Math.floor(Math.random() * 1000000).toString() // Use smaller numbers that PostgreSQL can handle
      }, ...prev]);
      
      toast.success('Properties compared successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
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
    if (userId) {
      localStorage.removeItem(`selectedProperties_${userId}`);
      sessionStorage.removeItem(`analyses_${userId}`);
    }
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

  const toggleAnalysis = (analysisId: string) => {
    setCollapsedAnalyses(prev => ({
      ...prev,
      [analysisId]: !prev[analysisId]
    }));
  };

  // Add useEffect to save collapsed state changes
  useEffect(() => {
    localStorage.setItem('collapsedAnalyses', JSON.stringify(collapsedAnalyses));
  }, [collapsedAnalyses]);

  const handleCompareWithPortfolio = async (analysisId: string, chatMessage: ChatMessage) => {
    try {
      setIsComparingPortfolio(prev => ({ ...prev, [analysisId]: true }));
      
      const portfolioResponse = await fetch('/api/portfolio');
      if (!portfolioResponse.ok) throw new Error('Failed to fetch portfolio');
      const portfolioData = await portfolioResponse.json();
      
      const response = await fetch('/api/chat/portfolio-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatMessage: chatMessage.content,
          portfolioProperties: portfolioData.properties,
          comparisonProperties: selectedProperties
        }),
      });

      if (!response.ok) throw new Error('Portfolio comparison failed');
      const data = await response.json();
      
      setChats(prev => {
        const updated = {
          ...prev,
          [analysisId]: [
            ...(prev[analysisId] || []),
            { role: 'assistant' as const, content: data.response }
          ]
        };
        localStorage.setItem('propertyChats', JSON.stringify(updated));
        return updated;
      });

    } catch (error) {
      console.error('Portfolio comparison error:', error);
      toast.error('Failed to compare with portfolio');
    } finally {
      setIsComparingPortfolio(prev => ({ ...prev, [analysisId]: false }));
    }
  };

  // Update localStorage effect for selectedProperties
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`selectedProperties_${userId}`, JSON.stringify(selectedProperties));
    }
  }, [selectedProperties, userId]);

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
            onClick={() => handleCompareProperties(selectedProperties)}
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

      {/* Selected Properties Section */}
      <div>
        {/* Desktop Grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
          {selectedProperties.map(property => (
            <PropertyCard
              key={property.id}
              property={property}
              onDelete={handleDelete}
              showDeleteButton={true}
            />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="block sm:hidden">
          {selectedProperties.length > 0 && (
            <PropertyCarousel
              properties={selectedProperties}
              onDelete={handleDelete}
              showDeleteButton={true}
            />
          )}
        </div>
      </div>

      {/* All Analyses */}
      <div className="space-y-6">
        {analyses.map((analysis, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-3 xs:p-4 sm:p-6 space-y-4">
            {/* Analysis Header - Always visible */}
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4">
              <h2 className="text-lg xs:text-xl font-semibold">Analysis Results</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => handleSaveToAnalyses(analysis)}
                  className="inline-flex items-center justify-center
                    px-4 py-2 rounded-lg text-sm font-medium
                    bg-black text-white
                    hover:bg-gray-800 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => handleDeleteAnalysis(analysis.id)}
                  className="inline-flex items-center justify-center
                    px-4 py-2 rounded-lg text-sm font-medium
                    border border-red-200 text-red-600
                    hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Properties Section - Always visible */}
            <div>
              {/* Desktop Grid */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
                {analysis.properties.map(property => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    showDeleteButton={false}
                    onSaveToFavorites={handleSaveToFavorites}
                  />
                ))}
              </div>

              {/* Mobile Carousel */}
              <div className="block sm:hidden">
                <PropertyCarousel
                  properties={analysis.properties}
                  showDeleteButton={false}
                  onSaveToFavorites={handleSaveToFavorites}
                />
              </div>
            </div>

            {/* Collapsible Analysis Text & Chat Section */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAnalysis(analysis.id)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label={collapsedAnalyses[analysis.id] ? "Show analysis" : "Hide analysis"}
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${collapsedAnalyses[analysis.id] ? '-rotate-90' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold">Analysis & Discussion</h3>
              </div>

              {/* Collapsible Content */}
              <div className={`mt-4 space-y-6 transition-all duration-200 ease-in-out ${
                collapsedAnalyses[analysis.id] ? 'hidden' : 'block'
              }`}>
                {/* Analysis Text */}
                <div className="space-y-4">
                  <div className="prose max-w-none text-sm xs:text-base">
                    {analysis.analysis.split('\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-3">{paragraph}</p>
                    ))}
                  </div>
                  
                  {/* Portfolio Comparison Button */}
                  <button
                    onClick={() => handleCompareWithPortfolio(analysis.id, {
                      role: 'assistant',
                      content: analysis.analysis
                    })}
                    disabled={isComparingPortfolio[analysis.id]}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium
                      ${isComparingPortfolio[analysis.id]
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      } transition-colors`}
                  >
                    {isComparingPortfolio[analysis.id] ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Comparing with Portfolio...
                      </span>
                    ) : (
                      'Compare with Portfolio'
                    )}
                  </button>
                </div>

                {/* Chat Interface */}
                <div className="mt-4 sm:mt-6 border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base sm:text-lg font-semibold">Chat about this Analysis</h3>
                    <button
                      onClick={() => clearChat(analysis.id)}
                      className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline"
                    >
                      Clear Chat
                    </button>
                  </div>

                  {/* Chat Messages - Remove the compare button from here */}
                  <div 
                    ref={(el: HTMLDivElement | null) => {
                      chatContainerRefs.current[analysis.id] = el;
                    }}
                    className="space-y-3 mb-4 max-h-[300px] xs:max-h-[400px] overflow-y-auto px-2"
                  >
                    {(chats[analysis.id] || []).map((message, i) => (
                      <div key={i} className="space-y-2">
                        <div
                          data-message
                          data-role={message.role}
                          className={`p-2 xs:p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-gray-100 ml-auto max-w-[85%] sm:max-w-[75%]'
                              : 'bg-blue-50 mr-auto max-w-[85%] sm:max-w-[75%]'
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form 
                    onSubmit={(e) => handleChatSubmit(e, analysis.id, analysis)} 
                    className="flex gap-2 w-full"
                  >
                    <input
                      type="text"
                      value={chatInput[analysis.id] || ''}
                      onChange={(e) => setChatInput(prev => ({
                        ...prev,
                        [analysis.id]: e.target.value
                      }))}
                      placeholder="Ask a question..."
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border rounded-lg 
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loadingChats[analysis.id]}
                    />
                    <button
                      type="submit"
                      disabled={loadingChats[analysis.id]}
                      className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-white text-sm sm:text-base 
                                 w-[80px] sm:w-[100px] flex items-center justify-center ${
                        loadingChats[analysis.id]
                          ? 'bg-gray-400'
                          : 'bg-black hover:bg-gray-800'
                      }`}
                    >
                      {loadingChats[analysis.id] ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
