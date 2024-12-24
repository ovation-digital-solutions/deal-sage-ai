'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/PropertyCard';
import { Property } from '@/types/property';

export default function BrowsePage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [searchForm, setSearchForm] = useState({
    city: '',
    state: ''
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchForm),
      });
      
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      setSearchResults(data.properties || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  const handlePropertySelect = (property: Property) => {
    setSelectedProperties(prev => {
      const isSelected = prev.some(p => p.id === property.id);
      if (isSelected) {
        return prev.filter(p => p.id !== property.id);
      }
      return [...prev, property];
    });
  };

  const handleCompare = async () => {
    if (selectedProperties.length < 2) return;
    
    // Save to localStorage for the compare page to access
    localStorage.setItem('selectedProperties', JSON.stringify(selectedProperties));
    
    // Navigate to compare page
    router.push('/dashboard/compare');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Browse Properties</h1>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
            <input
              type="text"
              id="city"
              value={searchForm.city}
              onChange={(e) => setSearchForm(prev => ({ ...prev, city: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
            <input
              type="text"
              id="state"
              value={searchForm.state}
              onChange={(e) => setSearchForm(prev => ({ ...prev, state: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Search Properties
        </button>
      </form>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchResults.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onSelect={() => handlePropertySelect(property)}
            isSelected={selectedProperties.some(p => p.id === property.id)}
          />
        ))}
      </div>

      {/* Selected Properties Bar */}
      {selectedProperties.length > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {selectedProperties.length} properties selected
              </span>
            </div>
            <button
              onClick={handleCompare}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Compare Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
