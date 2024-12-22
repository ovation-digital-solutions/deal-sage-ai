export interface PropertyData {
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  address: string;
  propertyType?: string;
}

export interface PropertyDetails {
  parking?: string | null;
  floors?: number | null;
  zoning?: string | null;
  tenancy?: string | null;
  occupancy?: string | null;
  construction?: string | null;
  utilities?: string | null;
  clearHeight?: string | null;
  propertySubType?: string | null;
  beds?: number | null;
  baths?: number | null;
  bathsFull?: number | null;
  bathsHalf?: number | null;
  isNewConstruction?: boolean;
  isForeclosure?: boolean;
  lastSoldDate?: string;
  listDate?: string;
  estimatedValue?: string;
}

export interface Property {
  id: string;
  address: string;
  price: number;
  propertyType: string;
  sqft: number;
  yearBuilt?: number | null;
  capRate?: string | null;
  pricePerSqFt?: number | null;
  lotSize?: string | null;
  description?: string | null;
  highlights?: string[];
  propertyDetails?: PropertyDetails;
}
