'use client';
import React from 'react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function PropertyCard({ property, onSelect, isSelected }: PropertyCardProps) {
  return (
    <div className={`
      relative p-4 border rounded-lg shadow-sm 
      ${isSelected ? 'border-black ring-2 ring-black' : 'border-gray-200'}
    `}>
      {onSelect && (
        <button
          onClick={onSelect}
          className={`
            absolute top-2 right-2 p-2 rounded-full
            ${isSelected 
              ? 'bg-black text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d={isSelected 
                ? "M5 13l4 4L19 7" 
                : "M12 4v16m8-8H4"
              } 
            />
          </svg>
        </button>
      )}

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
    </div>
  );
}
