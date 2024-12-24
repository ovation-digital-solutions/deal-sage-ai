export interface PropertyDetails {
  bedrooms: number;
  bathrooms: number;
  parking?: string;
  construction?: string;
  zoning?: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price?: number;
  sqft?: number;
  lotSize?: string;
  yearBuilt?: string;
  propertyType?: string;
  description?: string;
  propertyDetails?: PropertyDetails;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
