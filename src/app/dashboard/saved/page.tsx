'use client';
import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { Property } from '@/types/property';

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const response = await fetch('/api/properties/saved');
        const data = await response.json();
        setSavedProperties(data.properties);
      } catch (error) {
        console.error('Error fetching saved properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, []);

  return (
    <div className="w-full max-w-[2000px] mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
          Saved Properties
        </h1>
        <p className="mt-1 sm:mt-2 text-xs xs:text-sm sm:text-base text-gray-600">
          View and manage your saved property analyses.
        </p>
      </div>

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900"></div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">Loading properties...</p>
          </div>
        ) : savedProperties.length === 0 ? (
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 text-center">
            <div className="rounded-full bg-gray-100 p-2 sm:p-3 mb-3 sm:mb-4 inline-block">
              <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium text-sm sm:text-base">No saved properties yet</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              Properties you analyze and save will appear here
            </p>
          </div>
        ) : (
          <div className="grid gap-3 xs:gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {savedProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
