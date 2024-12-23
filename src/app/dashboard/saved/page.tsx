'use client';
import { useEffect, useState } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { Property } from '@/types/property';

export default function SavedProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const response = await fetch('/api/properties/saved');
        const data = await response.json();
        setProperties(data.properties);
      } catch (error) {
        console.error('Error fetching saved properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Saved Properties</h1>
      {properties.length === 0 ? (
        <p>No saved properties yet.</p>
      ) : (
        <div className="space-y-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
