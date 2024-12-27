'use client';
import React, { useState } from 'react';
import { Property } from '@/types/property';
import { toast } from 'react-hot-toast';

interface PropertyCardProps {
  property: Property;
  onDelete?: (propertyId: string) => Promise<void>;
  showDeleteButton?: boolean;
}

export function PropertyCard({ 
  property, 
  onDelete,
  showDeleteButton = false 
}: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!property.id || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.(property.id);
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative">
      <div className="relative p-4 border rounded-lg shadow-sm border-gray-200">
        <div className="space-y-2">
          <h3 className="font-medium">{property.address}</h3>
          <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
          <p className="text-lg font-bold">${property.price?.toLocaleString()}</p>
          <div className="text-sm text-gray-500">
            {property.propertyDetails && (
              <p>
                {property.propertyDetails.bedrooms} beds • {property.propertyDetails.bathrooms} baths
              </p>
            )}
            {property.sqft && <p>{property.sqft.toLocaleString()} sqft</p>}
          </div>
        </div>

        {showDeleteButton && onDelete && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors z-10"
            title="Remove from favorites"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <svg 
                className="w-4 h-4 text-red-500" 
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
            )}
          </button>
        )}
      </div>
    </div>
  );
}
