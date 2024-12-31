'use client';
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { toast } from 'react-hot-toast';

export default function ComparePage() {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [analyses, setAnalyses] = useState<{ properties: Property[]; analysis: string }[]>(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(sessionStorage.getItem('analyses') || '[]');
    }
    return [];
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      
      // Add new analysis to the beginning of the array
      setAnalyses(prev => [{
        properties: [...selectedProperties],
        analysis: data.analysis
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

  const handleSaveToAnalyses = async (item: { properties: Property[]; analysis: string }) => {
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
        {analyses.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 xs:p-6 space-y-4">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-4">
              <h2 className="text-lg xs:text-xl font-semibold">Analysis Results</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCompareProperties}
                  className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Regenerate Analysis
                </button>
                <button
                  onClick={() => {
                    const updatedAnalyses = analyses.filter((_, i) => i !== index);
                    setAnalyses(updatedAnalyses);
                  }}
                  className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Delete Analysis
                </button>
                <button
                  onClick={() => handleSaveToAnalyses(item)}
                  className="px-4 py-2 text-sm bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Save to Analyses
                </button>
              </div>
            </div>
            
            {/* Properties Grid with Save to Favorites */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
              {item.properties.map(property => (
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
              {item.analysis.split('\n').map((paragraph, pIndex) => (
                <p key={pIndex} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
