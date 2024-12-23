export interface PropertyDetails {
  propertySubType?: string;
  beds?: number;
  baths?: number;
  parking?: string;
  floors?: number;
  zoning?: string;
  tenancy?: string;
  occupancy?: string;
  construction?: string;
  utilities?: string;
  clearHeight?: string;
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
  yearBuilt?: number;
  lotSize?: string;
  description?: string;
  highlights?: string[];
  propertyDetails?: PropertyDetails;
  city: string;
  state: string;
  pricePerSqFt?: number;
  capRate?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
