export interface PropertyDetails {
  parking: string;
  floors: number | null;
  zoning: string;
  tenancy: string;
  occupancy: string;
  construction: string;
  utilities: string;
  clearHeight: string;
  yearBuilt: string;
  lastSoldDate: string;
  lastSoldPrice: string;
  lotSize: string;
  bedrooms: string;
  bathrooms: string;
  propertyTax: string;
}

export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  price: number;
  propertyType: string;
  sqft: number;
  yearBuilt: number | null;
  capRate: string;
  pricePerSqFt: number | null;
  lotSize: string;
  description: string;
  highlights: string[];
  propertyDetails: PropertyDetails;
  photoUrl?: string;
  web_url?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}
