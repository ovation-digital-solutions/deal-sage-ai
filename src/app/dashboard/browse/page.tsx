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
    <div className="relative min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl xs:text-2xl font-bold text-gray-900">Browse Properties</h1>
            <p className="mt-1 text-sm text-gray-500">
              Search and compare properties in your desired location
            </p>
          </div>
          <button
            onClick={handleCompare}
            disabled={selectedProperties.length < 2}
            className={`
              inline-flex items-center justify-center
              px-6 py-2.5 rounded-lg text-white text-sm font-medium
              shadow-sm transition-all duration-200 ease-in-out
              ${selectedProperties.length < 2
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-800 hover:shadow-md active:transform active:scale-[0.98]'
              }
            `}
          >
            Compare {selectedProperties.length} Properties
            {selectedProperties.length < 2 && <span className="ml-2 text-xs opacity-75">(Select at least 2)</span>}
          </button>
        </div>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                id="city"
                value={searchForm.city}
                onChange={(e) => setSearchForm(prev => ({ ...prev, city: e.target.value }))}
                className="block w-full h-12 px-4 rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-base"
                placeholder="Enter city name"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">State</label>
              <input
                type="text"
                id="state"
                value={searchForm.state}
                onChange={(e) => setSearchForm(prev => ({ ...prev, state: e.target.value }))}
                className="block w-full h-12 px-4 rounded-lg border-gray-300 shadow-sm focus:border-black focus:ring-black text-base"
                placeholder="Enter state"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg text-white text-base font-medium
                bg-black hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 ease-in-out
                active:transform active:scale-[0.98]"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Properties
            </button>
          </div>
        </form>

        {/* Results Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
          {searchResults.map(property => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <button
                onClick={() => handlePropertySelect(property)}
                className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition-colors z-10"
                title={selectedProperties.some(p => p.id === property.id) ? "Remove from comparison" : "Add to comparison"}
              >
                <svg 
                  className={`w-4 h-4 ${selectedProperties.some(p => p.id === property.id) ? 'text-red-500' : 'text-green-500'}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={selectedProperties.some(p => p.id === property.id) ? "M6 18L18 6M6 6l12 12" : "M12 6v12M6 12h12"}
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Properties Bar */}
      {selectedProperties.length > 0 && (
        <div className="fixed bottom-0 left-0 xs:left-14 sm:left-56 lg:left-64 right-0 bg-white border-t border-gray-200 p-3 xs:p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
            <div className="flex items-center gap-4">
              <span className="font-medium text-sm xs:text-base">
                {selectedProperties.length} properties selected
              </span>
            </div>
            <button
              onClick={handleCompare}
              className="w-full xs:w-auto px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm xs:text-base transition-colors"
            >
              Compare Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
