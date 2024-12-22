export interface PropertyData {
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  propertyType?: string;
}

export interface PropertyDetails {
  parking: string;
  floors: number;
  zoning: string;
  tenancy: string;
  occupancy: string;
  construction: string;
  utilities: string;
  clearHeight?: string;
}

export interface Property {
  id: string;
  address: string;
  price: number;
  propertyType: string;
  sqft: number;
  yearBuilt: number;
  capRate: string;
  pricePerSqFt: number;
  lotSize: string;
  description: string;
  highlights: string[];
  propertyDetails: PropertyDetails;
}
