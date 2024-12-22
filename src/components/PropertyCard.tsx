'use client';

import React from 'react';

interface PropertyDetails {
  parking?: string;
  floors?: number;
  zoning?: string;
  tenancy?: string;
  occupancy?: string;
  construction?: string;
  utilities?: string;
  clearHeight?: string;
}

interface Property {
  id: string;
  address: string;
  price: number;
  propertyType: string;
  sqft: number;
  yearBuilt?: number;
  capRate?: string;
  pricePerSqFt?: number;
  lotSize?: string;
  description?: string;
  highlights?: string[];
  propertyDetails?: PropertyDetails;
}

interface PropertyCardProps {
  property: Property;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      {/* Header Section */}
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{property.address}</h2>
        <div className="flex flex-wrap gap-4 mt-2">
          <span className="text-xl font-semibold text-green-600">
            ${property.price.toLocaleString()}
          </span>
          <span className="text-gray-600">
            {property.propertyType} | {property.sqft.toLocaleString()} SF
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricBox 
          label="Price/SF" 
          value={property.pricePerSqFt ? `$${property.pricePerSqFt}/SF` : 'N/A'} 
        />
        <MetricBox 
          label="Cap Rate" 
          value={property.capRate || 'N/A'} 
        />
        <MetricBox 
          label="Year Built" 
          value={property.yearBuilt?.toString() || 'N/A'} 
        />
        <MetricBox 
          label="Lot Size" 
          value={property.lotSize || 'N/A'} 
        />
      </div>

      {/* Description */}
      {property.description && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{property.description}</p>
        </div>
      )}

      {/* Highlights */}
      {property.highlights && property.highlights.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Property Highlights</h3>
          <ul className="list-disc pl-5 text-gray-600">
            {property.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Property Details */}
      {property.propertyDetails && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Property Details</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            {property.propertyDetails.parking && (
              <DetailRow label="Parking" value={property.propertyDetails.parking} />
            )}
            {property.propertyDetails.floors !== undefined && (
              <DetailRow label="Floors" value={property.propertyDetails.floors.toString()} />
            )}
            {property.propertyDetails.zoning && (
              <DetailRow label="Zoning" value={property.propertyDetails.zoning} />
            )}
            {property.propertyDetails.tenancy && (
              <DetailRow label="Tenancy" value={property.propertyDetails.tenancy} />
            )}
            {property.propertyDetails.occupancy && (
              <DetailRow label="Occupancy" value={property.propertyDetails.occupancy} />
            )}
            {property.propertyDetails.construction && (
              <DetailRow label="Construction" value={property.propertyDetails.construction} />
            )}
            {property.propertyDetails.utilities && (
              <DetailRow label="Utilities" value={property.propertyDetails.utilities} />
            )}
            {property.propertyDetails.clearHeight && (
              <DetailRow label="Clear Height" value={property.propertyDetails.clearHeight} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span>{value}</span>
  </div>
);
