'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyCard } from '@/components/PropertyCard';
import { Property } from '@/types/property';

// Price options in thousands (K) or millions (M)
const priceOptions = [
  { label: 'Any', value: '' },
  { label: '$100K', value: '100000' },
  { label: '$200K', value: '200000' },
  { label: '$300K', value: '300000' },
  { label: '$500K', value: '500000' },
  { label: '$750K', value: '750000' },
  { label: '$1M', value: '1000000' },
  { label: '$2M', value: '2000000' },
  { label: '$5M', value: '5000000' },
];

// Square footage options
const sqftOptions = [
  { label: 'Any', value: '' },
  { label: '500', value: '500' },
  { label: '1000', value: '1000' },
  { label: '1500', value: '1500' },
  { label: '2000', value: '2000' },
  { label: '2500', value: '2500' },
  { label: '3000', value: '3000' },
  { label: '4000', value: '4000' },
  { label: '5000', value: '5000' },
];

// Property type options
const propertyTypes = [
  { label: 'Any', value: '' },
  { label: 'Single Family', value: 'single_family' },
  { label: 'Multi Family', value: 'multi_family' },
  { label: 'Condo', value: 'condos' },
  { label: 'Townhouse', value: 'townhomes' },
  { label: 'Land', value: 'land' },
];

// Bedroom options
const bedroomOptions = ['Any', '1', '2', '3', '4', '5+'];

// Bathroom options
const bathroomOptions = ['Any', '1', '1.5', '2', '2.5', '3', '3.5', '4+'];

export default function BrowsePage() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchForm, setSearchForm] = useState({
    city: '',
    state: '',
    priceRange: {
      min: '',
      max: ''
    },
    sqftRange: {
      min: '',
      max: ''
    },
    bedrooms: '',
    bathrooms: '',
    propertyType: ''
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate required fields
    if (!searchForm.city || !searchForm.state) {
      setError('Please enter both city and state');
      setIsLoading(false);
      return;
    }

    try {
      // Only include non-empty values in the search params
      const searchParams = {
        city: searchForm.city,
        state: searchForm.state,
        priceRange: {
          min: searchForm.priceRange.min || undefined,
          max: searchForm.priceRange.max || undefined,
        },
        sqftRange: {
          min: searchForm.sqftRange.min || undefined,
          max: searchForm.sqftRange.max || undefined,
        },
        propertyType: searchForm.propertyType || undefined,
        bedrooms: searchForm.bedrooms || undefined,
        bathrooms: searchForm.bathrooms || undefined,
      };

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });
      
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      
      if (data.properties && data.properties.length === 0) {
        setError('No properties found matching your criteria. Try broadening your search.');
      }
      
      setSearchResults(data.properties || []);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to fetch properties. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
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
      <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 pb-24">
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
        <form onSubmit={handleSearch} className="mb-4 xs:mb-6 sm:mb-8 p-3 xs:p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-100">
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
            {/* Location Fields */}
            <div className="xs:col-span-2 lg:col-span-1">
              <label htmlFor="city" className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                value={searchForm.city}
                onChange={(e) => setSearchForm({ ...searchForm, city: e.target.value })}
                className="block w-full h-10 xs:h-12 px-3 xs:px-4 rounded-lg border-gray-300 shadow-sm 
                          focus:border-black focus:ring-black text-sm xs:text-base"
                placeholder="Enter city name"
              />
            </div>

            <div className="xs:col-span-2 lg:col-span-1">
              <label htmlFor="state" className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                value={searchForm.state}
                onChange={(e) => setSearchForm({ ...searchForm, state: e.target.value })}
                className="block w-full h-10 xs:h-12 px-3 xs:px-4 rounded-lg border-gray-300 shadow-sm 
                          focus:border-black focus:ring-black text-sm xs:text-base"
                placeholder="Enter state"
              />
            </div>

            {/* Price Range */}
            <div className="xs:col-span-2 lg:col-span-1">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={searchForm.priceRange.min}
                  onChange={(e) => setSearchForm({
                    ...searchForm,
                    priceRange: { ...searchForm.priceRange, min: e.target.value }
                  })}
                  className="block w-full h-10 xs:h-12 px-2 xs:px-3 rounded-lg border-gray-300 shadow-sm 
                            focus:border-black focus:ring-black text-sm xs:text-base"
                >
                  <option value="">Min Price</option>
                  {priceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={searchForm.priceRange.max}
                  onChange={(e) => setSearchForm({
                    ...searchForm,
                    priceRange: { ...searchForm.priceRange, max: e.target.value }
                  })}
                  className="block w-full h-10 xs:h-12 px-2 xs:px-3 rounded-lg border-gray-300 shadow-sm 
                            focus:border-black focus:ring-black text-sm xs:text-base"
                >
                  <option value="">Max Price</option>
                  {priceOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Square Footage */}
            <div className="xs:col-span-2 lg:col-span-1">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                Square Footage
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={searchForm.sqftRange.min}
                  onChange={(e) => setSearchForm({
                    ...searchForm,
                    sqftRange: { ...searchForm.sqftRange, min: e.target.value }
                  })}
                  className="block w-full h-10 xs:h-12 px-2 xs:px-3 rounded-lg border-gray-300 shadow-sm 
                            focus:border-black focus:ring-black text-sm xs:text-base"
                >
                  <option value="">Min Sqft</option>
                  {sqftOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  value={searchForm.sqftRange.max}
                  onChange={(e) => setSearchForm({
                    ...searchForm,
                    sqftRange: { ...searchForm.sqftRange, max: e.target.value }
                  })}
                  className="block w-full h-10 xs:h-12 px-2 xs:px-3 rounded-lg border-gray-300 shadow-sm 
                            focus:border-black focus:ring-black text-sm xs:text-base"
                >
                  <option value="">Max Sqft</option>
                  {sqftOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Property Details */}
            <div className="xs:col-span-2 lg:col-span-1">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                Property Details
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={searchForm.propertyType}
                  onChange={(e) => setSearchForm({ ...searchForm, propertyType: e.target.value })}
                  className="block w-full h-10 xs:h-12 px-2 xs:px-3 rounded-lg border-gray-300 shadow-sm 
                            focus:border-black focus:ring-black text-sm xs:text-base"
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                
                <select
                  value={searchForm.bedrooms}
                  onChange={(e) => setSearchForm({ ...searchForm, bedrooms: e.target.value })}
                  className="block w-full h-10 xs:h-12 px-2 xs:px-3 rounded-lg border-gray-300 shadow-sm 
                            focus:border-black focus:ring-black text-sm xs:text-base"
                >
                  {bedroomOptions.map(value => (
                    <option key={value} value={value === 'Any' ? '' : value}>
                      {value === 'Any' ? 'Beds' : value}
                    </option>
                  ))}
                </select>

                <select
                  value={searchForm.bathrooms}
                  onChange={(e) => setSearchForm({ ...searchForm, bathrooms: e.target.value })}
                  className="block w-full h-10 xs:h-12 px-2 xs:px-3 rounded-lg border-gray-300 shadow-sm 
                            focus:border-black focus:ring-black text-sm xs:text-base"
                >
                  {bathroomOptions.map(value => (
                    <option key={value} value={value === 'Any' ? '' : value}>
                      {value === 'Any' ? 'Baths' : value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-end mt-4 xs:mt-6">
            <button
              type="submit"
              className="w-full xs:w-auto px-4 xs:px-8 py-2 xs:py-3 rounded-lg text-white 
                       text-sm xs:text-base font-medium bg-black hover:bg-gray-800 
                       shadow-sm hover:shadow-md transition-all duration-200 ease-in-out
                       active:transform active:scale-[0.98]"
            >
              <span className="flex items-center justify-center">
                <svg className="w-4 h-4 xs:w-5 xs:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search Properties
              </span>
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && searchResults.length > 0 && (
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
        )}

        {/* No Results Message */}
        {!isLoading && searchResults.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            Enter a city and state to search for properties
          </div>
        )}

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
    </div>
  );
}
