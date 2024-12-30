'use client';
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { toast } from 'react-hot-toast';

export default function ComparePage() {
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [comparison, setComparison] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [savingProperty, setSavingProperty] = useState<string | null>(null);

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
    
    // Clear comparison if less than 2 properties
    if (updatedProperties.length < 2) {
      setComparison('');
    }
  };

  const handleCompareProperties = async () => {
    setIsAnalyzing(true);
    try {
      // Get comparison analysis
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: selectedProperties }),
      });

      if (!response.ok) throw new Error('Comparison failed');
      const data = await response.json();
      setComparison(data.analysis);

      // Save the analysis with complete property data including images
      await fetch('/api/analyses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: selectedProperties.map(property => ({
            id: property.id,
            address: property.address,
            price: property.price,
            image_url: property.photoUrl,
            // Include any other necessary property data
          })),
          analysisText: data.analysis
        }),
      });

      toast.success('Properties compared and analysis saved');
    } catch (error) {
      console.error('Comparison error:', error);
      toast.error('Failed to compare properties');
    } finally {
      setIsAnalyzing(false);
    }
  };

  

  const handleSaveToFavorites = async (property: Property) => {
    setSavingProperty(property.id);
    try {
      const response = await fetch('/api/properties/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...property,
          id: property.id || property.address
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save property');
      }
      
      toast.success(`${property.address} saved to favorites!`);
    } catch (error) {
      console.error('Error saving to favorites:', error);
      toast.error('Failed to save to favorites');
    } finally {
      setSavingProperty(null);
    }
  };

  const handleClearAll = () => {
    setSelectedProperties([]);
    localStorage.removeItem('selectedProperties');
    setComparison('');
    toast.success('All properties cleared from comparison');
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

      {/* Comparison Results */}
      {comparison && (
        <div className="bg-white rounded-lg shadow-sm p-4 xs:p-6 space-y-4">
          <h2 className="text-lg xs:text-xl font-semibold">Analysis Results</h2>
          <div className="prose max-w-none text-sm xs:text-base">
            {comparison.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-3">{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-col xs:flex-row flex-wrap gap-3 xs:gap-4 mt-4 xs:mt-6">
            {selectedProperties.map(property => (
              <button
                key={property.id}
                onClick={() => handleSaveToFavorites(property)}
                disabled={savingProperty === property.id}
                className={`
                  w-full xs:w-auto px-3 xs:px-4 py-2 text-sm rounded-lg 
                  transition-all duration-200 ease-in-out
                  ${savingProperty === property.id
                    ? 'bg-gray-200 cursor-wait'
                    : 'bg-gray-100 hover:bg-gray-200 xs:hover:shadow-md xs:hover:transform xs:hover:-translate-y-0.5'
                  }
                `}
              >
                {savingProperty === property.id ? 'Saving...' : `Save ${property.address} to Favorites`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
