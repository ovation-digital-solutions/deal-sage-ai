'use client';

import { PropertyCard } from '@/components/PropertyCard';
import { useState } from 'react';
import { Property } from '@/types/property';

export default function AnalyzePage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, state }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch properties');
      }

      setProperties(data.properties);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Form */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Property Search</h1>
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <button 
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading properties...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
          {error}
        </div>
      ) : properties.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          No properties found. Try searching for a different location.
        </div>
      )}
    </div>
  );
}
