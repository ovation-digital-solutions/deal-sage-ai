'use client';
import React, { useState } from 'react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: property.id,
          propertyType: property.propertyType,
          price: property.price,
          sqft: property.sqft,
          lotSize: property.lotSize,
          yearBuilt: property.yearBuilt,
          address: property.address,
          description: property.description,
          propertyDetails: property.propertyDetails
        }),
      });
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setAnalysis(data.analysis);
      setShowAnalysis(true);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('Failed to analyze property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/properties/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: property.id,
          propertyData: property
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save property');
      }

      setIsSaved(true);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save property. Please try again.');
    }
  };

  const cardId = property.id || `property-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div key={cardId} className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{property.address}</h2>
        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`px-4 py-2 rounded-full ${
            isSaved 
              ? 'bg-green-500 text-white cursor-default'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSaved ? 'Saved' : 'Save Property'}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricBox 
          label="Price/SF" 
          value={property.pricePerSqFt ? `$${property.pricePerSqFt.toLocaleString()}/SF` : 'N/A'} 
        />
        <MetricBox label="Cap Rate" value={property.capRate} />
        <MetricBox label="Year Built" value={property.yearBuilt?.toString() || 'N/A'} />
        <MetricBox label="Lot Size" value={property.lotSize} />
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
              <li key={`${property.id}-highlight-${index}`}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Property Details */}
      {property.propertyDetails && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Property Details</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-600">
            {property.propertyDetails.propertySubType && (
              <DetailRow label="Property Type" value={property.propertyDetails.propertySubType} />
            )}
            {property.propertyDetails.beds && (
              <DetailRow label="Beds" value={property.propertyDetails.beds.toString()} />
            )}
            {property.propertyDetails.baths && (
              <DetailRow label="Baths" value={property.propertyDetails.baths.toString()} />
            )}
            {property.propertyDetails.parking && (
              <DetailRow label="Parking" value={property.propertyDetails.parking} />
            )}
            {property.propertyDetails.floors !== undefined && property.propertyDetails.floors !== null && (
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
            {property.propertyDetails.lastSoldDate && (
              <DetailRow label="Last Sold" value={property.propertyDetails.lastSoldDate} />
            )}
            {property.propertyDetails.listDate && (
              <DetailRow label="Listed Date" value={property.propertyDetails.listDate} />
            )}
            {property.propertyDetails.estimatedValue && (
              <DetailRow label="Estimated Value" value={property.propertyDetails.estimatedValue} />
            )}
          </div>
        </div>
      )}

      {/* Add Analysis Button and Results */}
      <div className="mt-6 border-t pt-4">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Analyzing...' : 'Analyze Investment Opportunity'}
        </button>

        {showAnalysis && analysis && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
            <div className="bg-gray-50 p-4 rounded-lg prose max-w-none">
              <div className="whitespace-pre-wrap">{analysis}</div>
            </div>
            <button
              onClick={() => setShowAnalysis(false)}
              className="mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Hide Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const MetricBox: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="font-semibold">{value || 'N/A'}</div>
  </div>
);

const DetailRow: React.FC<{ label: string; value: string | null | undefined }> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm font-medium text-gray-500">{label}</span>
    <span>{value || 'N/A'}</span>
  </div>
);
