'use client';
import { useState } from 'react';

interface Property {
  id: string;
  address: string;
  price: number;
  propertyType: string;
  sqft: number;
}

interface ApiError {
  error: string;
  details?: string;
}

export default function AnalyzeForm() {
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Search for properties
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        body: JSON.stringify({ city, state }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if ('error' in data) {
        console.error('API Error:', (data as ApiError).error);
        return;
      }
      setProperties(data.properties);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Analyze selected property
  const handleAnalyze = async () => {
    if (!selectedProperty) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ propertyId: selectedProperty }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label htmlFor="city" className="block mb-2">
            City
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="New York"
          />
        </div>
        <div>
          <label htmlFor="state" className="block mb-2">
            State
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="w-full p-2 border rounded"
            placeholder="NY"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-foreground text-background px-5 py-3 hover:bg-[#383838]"
        >
          {loading ? 'Searching...' : 'Search Properties'}
        </button>
      </form>

      {properties.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Available Properties</h2>
          <div className="space-y-4">
            {properties.map((property) => (
              <div 
                key={property.id}
                className={`p-4 border rounded cursor-pointer ${
                  selectedProperty === property.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setSelectedProperty(property.id)}
              >
                <p className="font-bold">{property.address}</p>
                <p>${property.price.toLocaleString()}</p>
                <p>{property.propertyType}</p>
                <p>{property.sqft.toLocaleString()} sqft</p>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={!selectedProperty || loading}
            className="mt-4 rounded-full bg-foreground text-background px-5 py-3 hover:bg-[#383838]"
          >
            {loading ? 'Analyzing...' : 'Analyze Selected Property'}
          </button>
        </div>
      )}

      {analysis && (
        <div className="mt-8 p-4 border rounded">
          <h2 className="text-xl font-bold mb-4">Analysis Results</h2>
          <div className="prose whitespace-pre-wrap">
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
}
