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

  const handleCompare = async () => {
    if (selectedProperties.length < 2) return;
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties: selectedProperties }),
      });

      if (!response.ok) throw new Error('Comparison failed');
      const data = await response.json();
      setComparison(data.analysis);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 xs:py-8 space-y-6 xs:space-y-8">
      <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-4 xs:gap-0">
        <h1 className="text-xl xs:text-2xl font-bold">Compare Properties</h1>
        <button
          onClick={handleCompare}
          disabled={selectedProperties.length < 2 || isAnalyzing}
          className={`
            w-full xs:w-auto px-4 py-2 xs:py-2.5 rounded-lg text-white text-sm xs:text-base
            transition-all duration-200 ease-in-out
            ${selectedProperties.length < 2 || isAnalyzing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800 xs:hover:shadow-md xs:hover:transform xs:hover:-translate-y-0.5'
            }
          `}
        >
          {isAnalyzing ? 'Analyzing...' : 'Compare Selected'}
        </button>
      </div>

      {/* Selected Properties Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
        {selectedProperties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
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
