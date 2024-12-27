'use client';
import { useState, useEffect } from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from '@/components/PropertyCard';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/properties/favorite');
        
        if (response.status === 401) {
          // Unauthorized - redirect to login
          router.push('/login');
          return;
        }
        
        if (!response.ok) throw new Error('Failed to fetch favorites');
        
        const data = await response.json();
        setFavorites(data.properties || []);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        toast.error('Failed to load favorite properties');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [router]);

  const handleRemoveFavorite = async (propertyId: string) => {
    try {
      const response = await fetch(`/api/properties/favorite/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove from favorites');
      
      setFavorites(prev => prev.filter(p => p.id !== propertyId));
      toast.success('Property removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 xs:h-8 xs:w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 xs:py-8 space-y-6 xs:space-y-8">
      <h1 className="text-xl xs:text-2xl font-bold">Favorite Properties</h1>
      
      {favorites.length === 0 ? (
        <div className="text-center py-8 xs:py-12">
          <p className="text-gray-500 text-sm xs:text-base">No favorite properties yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xs:gap-6">
          {favorites.map(property => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <button
                onClick={() => handleRemoveFavorite(property.id)}
                className="absolute -top-1 -right-1 p-1 bg-white rounded-full shadow hover:bg-red-50 transition-colors z-10"
                title="Remove from favorites"
              >
                <svg 
                  className="w-3.5 h-3.5 text-red-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
