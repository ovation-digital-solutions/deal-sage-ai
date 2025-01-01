'use client';
import React, { useState } from 'react';
import { Property } from '@/types/property';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface PropertyCardProps {
  property: Property;
  onDelete?: (propertyId: string) => Promise<void>;
  showDeleteButton?: boolean;
}

export function PropertyCard({ property, onDelete, showDeleteButton = false }: PropertyCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  console.log('Property photo URL:', property.photoUrl);

  const getValidImageUrl = (url?: string) => {
    if (!url) return null;
    try {
      const validUrl = new URL(url);
      if (validUrl.protocol !== 'https:') {
        validUrl.protocol = 'https:';
      }
      return validUrl.toString();
    } catch {
      console.error('Invalid image URL:', url);
      return null;
    }
  };

  const validImageUrl = getValidImageUrl(property.photoUrl);

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
      <div className="relative p-4 border rounded-lg shadow-sm border-gray-200 h-[400px] flex flex-col">
        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {validImageUrl && !imageError ? (
            <Image
              src={validImageUrl}
              alt={`Photo of ${property.address}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              priority={false}
              onError={() => {
                console.error('Image failed to load:', validImageUrl);
                setImageError(true);
              }}
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <svg 
                className="w-12 h-12 text-gray-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-grow">
          <div className="h-full flex flex-col">
            <div className="min-h-[4rem]">
              <h3 className="font-medium text-base line-clamp-2 mb-1">{property.address}</h3>
              <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
            </div>

            <div className="min-h-[2rem]">
              <p className="text-lg font-bold">${property.price?.toLocaleString()}</p>
            </div>

            <div className="text-sm text-gray-500 min-h-[3rem]">
              {property.propertyDetails && (
                <p className="mb-1">
                  {property.propertyDetails.bedrooms} beds • {property.propertyDetails.bathrooms} baths
                </p>
              )}
              {property.sqft && <p>{property.sqft.toLocaleString()} sqft</p>}
            </div>
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
