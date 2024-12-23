'use client';
import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import AnalyzeForm from '@/components/AnalyzeForm';
import { Property } from '@/types/property';

export default function Dashboard() {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const response = await fetch('/api/properties/saved');
        const data = await response.json();
        setSavedProperties(data.properties);
      } catch (error) {
        console.error('Error fetching saved properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedProperties();
  }, []);

  const handleSearch = async (city: string, state: string) => {
    setSearchLoading(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ city, state })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data.properties || []);
    } catch (error) {
      console.error('Error searching properties:', error);
      setSearchResults([]); // Clear results on error
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Analyze new properties and manage your saved deals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              {isLoading ? (
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{savedProperties.length}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Analyses Run</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Market Updates</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-2 mr-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Saved Deals</p>
              <p className="text-2xl font-bold text-gray-900">{savedProperties.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Analyze Form */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            Analyze a New Deal
          </h2>
          <div className="max-w-2xl">
            <AnalyzeForm onSearch={handleSearch} />
          </div>
        </div>

        {/* Right Column - Search Results */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              {isLoading ? 'Loading...' : searchLoading ? 'Searching...' : 'Search Results'}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
          ) : searchLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-sm text-gray-600">Searching properties...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No properties found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try searching with different criteria
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.map((property, index) => (
                <PropertyCard 
                  key={`${property.id || index}-${index}`}
                  property={property} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
