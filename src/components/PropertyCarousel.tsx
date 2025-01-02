'use client';
import { useState } from 'react';
import { Property } from '@/types/property';
import { PropertyCard } from './PropertyCard';

interface PropertyCarouselProps {
  properties: Property[];
  onDelete?: (propertyId: string) => Promise<void>;
  showDeleteButton?: boolean;
  onSaveToFavorites?: (property: Property) => void;
}

export function PropertyCarousel({
  properties,
  onDelete,
  showDeleteButton = false,
  onSaveToFavorites
}: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === properties.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? properties.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div className="relative">
          <PropertyCard
            property={properties[currentIndex]}
            onDelete={onDelete}
            showDeleteButton={showDeleteButton}
            onSaveToFavorites={onSaveToFavorites}
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={prevSlide}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm"
        >
          Previous
        </button>
        <span className="text-sm">
          {currentIndex + 1} / {properties.length}
        </span>
        <button
          onClick={nextSlide}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
