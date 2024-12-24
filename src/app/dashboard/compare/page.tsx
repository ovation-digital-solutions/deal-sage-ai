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
        body: JSON.stringify({ propertyId: property.id, propertyData: property }),
      });

      if (!response.ok) throw new Error('Failed to save property');
      toast.success(`${property.address} saved to favorites!`);
    } catch (error) {
      console.error('Error saving to favorites:', error);
      toast.error('Failed to save property to favorites');
    } finally {
      setSavingProperty(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Compare Properties</h1>
        <button
          onClick={handleCompare}
          disabled={selectedProperties.length < 2 || isAnalyzing}
          className={`
            px-4 py-2 rounded-lg text-white
            ${selectedProperties.length < 2 || isAnalyzing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
            }
          `}
        >
          {isAnalyzing ? 'Analyzing...' : 'Compare Selected'}
        </button>
      </div>

      {/* Selected Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedProperties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
          />
        ))}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold">Analysis Results</h2>
          <div className="prose max-w-none">
            {comparison.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            {selectedProperties.map(property => (
              <button
                key={property.id}
                onClick={() => handleSaveToFavorites(property)}
                disabled={savingProperty === property.id}
                className={`
                  px-4 py-2 text-sm rounded-lg transition-all
                  ${savingProperty === property.id
                    ? 'bg-gray-200 cursor-wait'
                    : 'bg-gray-100 hover:bg-gray-200 hover:shadow-sm'
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
