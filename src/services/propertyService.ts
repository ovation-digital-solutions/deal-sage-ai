import axios from 'axios';
import { Property } from '@/types/property';

// Add interfaces for API responses and property data
interface PropertyLocation {
  address: {
    line?: string;
    city?: string;
    state?: string;
    state_code?: string;
    postal_code?: string;
    county?: string;
    lat?: number;
    long?: number;
    neighborhood_name?: string;
  };
}

interface PropertyFeature {
  category?: string;
  text?: string;
}

interface PropertyDescription {
  type?: string;
  sqft?: number;
  year_built?: number;
  text?: string;
  parking?: string;
  stories?: number;
  zoning?: string;
  occupancy_type?: string;
  occupancy?: number;
  construction?: string;
  utilities?: string;
  lot_sqft?: number;
  beds?: number;
  baths?: number;
}

interface PropertyFlags {
  is_new_listing?: boolean;
}

interface PropertyFinancial {
  cap_rate?: number;
}

interface PropertyPhoto {
  href: string;
}

interface PropertySearchResponse {
  data: {
    home_search: {
      results: BasicProperty[];
      count: number;
      total: number;
    };
  };
}

interface PropertyListing {
  sqft?: number;
  year_built?: number;
  prop_type?: string;
  description?: string;
  lot_sqft?: number;
  beds?: number;
  baths?: number;
}

interface BasicProperty {
  property_id: string;
  location: PropertyLocation;
  list_price: number;
  description?: PropertyDescription;
  features?: PropertyFeature[];
  flags?: PropertyFlags;
  financial?: PropertyFinancial;
  listing?: PropertyListing;
  photos?: PropertyPhoto[];
}

interface PropertyDetails {
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

interface MergedPropertyData {
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
}

interface SearchParams {
  city: string;
  state: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  sqftRange?: {
    min?: number;
    max?: number;
  };
  bedrooms?: string;
  bathrooms?: string;
  propertyType?: string;
}

export class PropertyService {
  private readonly rapidApiKey: string;
  private readonly rapidApiHost: string;
  private readonly stateCodeMap: { [key: string]: string } = {
    'ALABAMA': 'AL',
    'ALASKA': 'AK',
    'ARIZONA': 'AZ',
    'ARKANSAS': 'AR',
    'CALIFORNIA': 'CA',
    'COLORADO': 'CO',
    'CONNECTICUT': 'CT',
    'DELAWARE': 'DE',
    'FLORIDA': 'FL',
    'GEORGIA': 'GA',
    'HAWAII': 'HI',
    'IDAHO': 'ID',
    'ILLINOIS': 'IL',
    'INDIANA': 'IN',
    'IOWA': 'IA',
    'KANSAS': 'KS',
    'KENTUCKY': 'KY',
    'LOUISIANA': 'LA',
    'MAINE': 'ME',
    'MARYLAND': 'MD',
    'MASSACHUSETTS': 'MA',
    'MICHIGAN': 'MI',
    'MINNESOTA': 'MN',
    'MISSISSIPPI': 'MS',
    'MISSOURI': 'MO',
    'MONTANA': 'MT',
    'NEBRASKA': 'NE',
    'NEVADA': 'NV',
    'NEW HAMPSHIRE': 'NH',
    'NEW JERSEY': 'NJ',
    'NEW MEXICO': 'NM',
    'NEW YORK': 'NY',
    'NORTH CAROLINA': 'NC',
    'NORTH DAKOTA': 'ND',
    'OHIO': 'OH',
    'OKLAHOMA': 'OK',
    'OREGON': 'OR',
    'PENNSYLVANIA': 'PA',
    'RHODE ISLAND': 'RI',
    'SOUTH CAROLINA': 'SC',
    'SOUTH DAKOTA': 'SD',
    'TENNESSEE': 'TN',
    'TEXAS': 'TX',
    'UTAH': 'UT',
    'VERMONT': 'VT',
    'VIRGINIA': 'VA',
    'WASHINGTON': 'WA',
    'WEST VIRGINIA': 'WV',
    'WISCONSIN': 'WI',
    'WYOMING': 'WY'
  };

  constructor() {
    this.rapidApiKey = process.env.RAPID_API_KEY || '';
    this.rapidApiHost = 'realty-in-us.p.rapidapi.com';
  }

  private getStateCode(state: string): string {
    console.log('Getting state code for:', state); // Debug log

    // Handle empty or null input
    if (!state) {
      throw new Error('State is required');
    }

    // Clean the input: trim whitespace and convert to uppercase
    const cleanState = state.trim().toUpperCase();
    console.log('Cleaned state input:', cleanState); // Debug log

    // If it's already a valid 2-letter code, return it
    if (/^[A-Z]{2}$/.test(cleanState)) {
      console.log('Valid state code provided:', cleanState);
      return cleanState;
    }

    // Try to find the state code from the full name
    const stateCode = this.stateCodeMap[cleanState];
    console.log('Looked up state code:', stateCode); // Debug log

    if (!stateCode) {
      console.log('Available state mappings:', Object.keys(this.stateCodeMap)); // Debug log
      throw new Error(`Invalid state: ${state}. Please use a valid two-letter state code or full state name.`);
    }

    return stateCode;
  }

  private async getRealtyData(searchParams: SearchParams): Promise<PropertySearchResponse> {
    const stateCode = this.getStateCode(searchParams.state);
    console.log('Search parameters received:', JSON.stringify(searchParams, null, 2));

    // Build filters object with correct property paths
    const filters = {} as {
      property_type?: string;
      list_price?: { min: number; max: number };
      building_size?: { min: number; max: number };
      beds?: number | { min: number };
      baths?: number | { min: number };
    };

    // Property type mapping with all possible variations
    const propertyTypeMap: Record<string, string> = {
      'single_family': 'single_family',
      'multi_family': 'multi_family',
      'condos': 'condos',
      'commercial': 'commercial',
      'industrial': 'industrial',
      'retail': 'retail',
      'townhomes': 'townhome',
      'land': 'land'
    };

    // Add property type filter
    if (searchParams.propertyType && searchParams.propertyType !== '') {
      const mappedType = propertyTypeMap[searchParams.propertyType];
      if (mappedType) {
        filters.property_type = mappedType;
      }
    }

    // Add price range filter
    if (searchParams.priceRange?.min || searchParams.priceRange?.max) {
      const minPrice = searchParams.priceRange.min ? Number(searchParams.priceRange.min) : 0;
      const maxPrice = searchParams.priceRange.max ? Number(searchParams.priceRange.max) : 100000000;
      
      if (!isNaN(minPrice) && !isNaN(maxPrice)) {
        filters.list_price = {
          min: minPrice,
          max: maxPrice
        };
      }
    }

    // Add square footage filter
    if (searchParams.sqftRange?.min || searchParams.sqftRange?.max) {
      const minSqft = searchParams.sqftRange.min ? Number(searchParams.sqftRange.min) : 0;
      const maxSqft = searchParams.sqftRange.max ? Number(searchParams.sqftRange.max) : 100000;
      
      if (!isNaN(minSqft) && !isNaN(maxSqft)) {
        filters.building_size = {
          min: minSqft,
          max: maxSqft
        };
      }
    }

    // Add bedrooms filter
    if (searchParams.bedrooms && searchParams.bedrooms !== '') {
      const bedroomCount = parseInt(searchParams.bedrooms);
      if (!isNaN(bedroomCount)) {
        filters.beds = bedroomCount === 5 ? { min: 5 } : bedroomCount;
      }
    }

    // Add bathrooms filter
    if (searchParams.bathrooms && searchParams.bathrooms !== '') {
      const bathroomCount = parseFloat(searchParams.bathrooms);
      if (!isNaN(bathroomCount)) {
        filters.baths = bathroomCount === 4 ? { min: 4 } : bathroomCount;
      }
    }

    console.log('Constructed filters:', JSON.stringify(filters, null, 2));

    const requestData = {
      limit: 20,
      offset: 0,
      city: searchParams.city,
      state_code: stateCode,
      sort: {
        direction: 'desc',
        field: 'list_date'
      },
      filters: filters
    };

    console.log('Final API request data:', JSON.stringify(requestData, null, 2));

    const options = {
      method: 'POST',
      url: `https://${this.rapidApiHost}/properties/v3/list`,
      headers: {
        'content-type': 'application/json',
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': this.rapidApiHost
      },
      data: requestData
    };

    try {
      const response = await axios.request(options);
      console.log('API response status:', response.status);
      console.log('API response data:', JSON.stringify(response.data, null, 2));
      
      // Validate response data matches filters
      const results = response.data?.data?.home_search?.results || [];
      console.log(`Received ${results.length} properties`);
      
      // Log any properties that don't match the filters
      if (filters.list_price?.min !== undefined && filters.list_price?.max !== undefined) {
        const invalidPrices = results.filter((prop: { list_price: number }) => 
          prop.list_price < filters.list_price!.min || 
          prop.list_price > filters.list_price!.max
        );
        if (invalidPrices.length > 0) {
          console.warn('Properties outside price range:', 
            invalidPrices.map((p: { property_id: string; list_price: number }) => ({
              id: p.property_id,
              price: p.list_price
            }))
          );
        }
      }

      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Add this new method to fetch photos
  private async getPropertyPhotos(propertyId: string): Promise<string | undefined> {
    try {
      const options = {
        method: 'GET',
        url: `https://${this.rapidApiHost}/properties/v3/get-photos`,
        headers: {
          'x-rapidapi-key': this.rapidApiKey,
          'x-rapidapi-host': this.rapidApiHost
        },
        params: { property_id: propertyId }
      };

      const response = await axios.request(options);
      
      // Detailed logging of the response structure
      console.log('Full photo response for property:', propertyId, JSON.stringify(response.data, null, 2));

      // Try different paths to find photos
      const photos = response.data?.data?.home_search?.results?.[0]?.photos ||
                    response.data?.data?.photos ||
                    response.data?.photos;

      if (Array.isArray(photos) && photos.length > 0) {
        console.log('Found photos array:', photos);
        const photoUrl = photos[0].href;
        console.log('Using photo URL:', photoUrl);
        return photoUrl;
      }

      // If we can't find photos, log the entire response structure
      console.log('Response structure:', {
        hasData: !!response.data,
        dataKeys: Object.keys(response.data || {}),
        homeSearch: response.data?.data?.home_search,
        results: response.data?.data?.home_search?.results,
        firstResult: response.data?.data?.home_search?.results?.[0]
      });

      return undefined;
    } catch (error) {
      console.error('Error fetching photos for property:', propertyId, error);
      return undefined;
    }
  }

  private async mergePropertyData(basicProperty: BasicProperty): Promise<MergedPropertyData> {
    const photoUrl = await this.getPropertyPhotos(basicProperty.property_id);
    
    // Extract property details from the API response
    const sqft = basicProperty.listing?.sqft || 
                 basicProperty.description?.sqft || 
                 0;
                 
    const yearBuilt = basicProperty.listing?.year_built || 
                      basicProperty.description?.year_built || 
                      null;

    const bedrooms = basicProperty.description?.beds || 
                    basicProperty.listing?.beds || 
                    'N/A';
                    
    const bathrooms = basicProperty.description?.baths || 
                     basicProperty.listing?.baths || 
                     'N/A';

    const lotSqft = basicProperty.description?.lot_sqft || 
                    basicProperty.listing?.lot_sqft;
                    
    const lotSize = lotSqft ? `${(lotSqft / 43560).toFixed(2)} acres` : 'N/A';

    const propertyData: MergedPropertyData = {
      id: basicProperty.property_id,
      address: basicProperty.location.address.line || '',
      city: basicProperty.location.address.city || '',
      state: basicProperty.location.address.state_code || basicProperty.location.address.state || '',
      price: basicProperty.list_price,
      propertyType: basicProperty.description?.type || 'Residential',
      sqft: sqft,
      yearBuilt: yearBuilt,
      capRate: basicProperty.financial?.cap_rate?.toString() || 'N/A',
      pricePerSqFt: sqft > 0 ? Math.round(basicProperty.list_price / sqft) : null,
      lotSize: lotSize,
      description: basicProperty.description?.text || 'No description available',
      highlights: [
        yearBuilt ? `Year Built: ${yearBuilt}` : null,
        basicProperty.flags?.is_new_listing ? 'New Listing' : null,
        lotSize !== 'N/A' ? `Lot Size: ${lotSize}` : null
      ].filter(Boolean) as string[],
      propertyDetails: {
        parking: basicProperty.description?.parking || 'N/A',
        floors: basicProperty.description?.stories || null,
        zoning: basicProperty.description?.zoning || 'N/A',
        tenancy: basicProperty.description?.occupancy_type || 'N/A',
        occupancy: basicProperty.description?.occupancy?.toString() || 'N/A',
        construction: basicProperty.description?.construction || 'N/A',
        utilities: basicProperty.description?.utilities || 'N/A',
        clearHeight: 'N/A',
        yearBuilt: yearBuilt?.toString() || 'N/A',
        lastSoldDate: 'N/A',
        lastSoldPrice: 'N/A',
        lotSize: lotSize,
        bedrooms: bedrooms.toString(),
        bathrooms: bathrooms.toString(),
        propertyTax: 'N/A'
      },
      photoUrl: photoUrl
    };

    // Debug log
    console.log('Processed property data:', {
      id: propertyData.id,
      address: propertyData.address,
      sqft: propertyData.sqft,
      beds: propertyData.propertyDetails.bedrooms,
      baths: propertyData.propertyDetails.bathrooms,
      photoUrl: propertyData.photoUrl
    });

    return propertyData;
  }

  public async searchProperties(searchParams: SearchParams): Promise<Property[]> {
    try {
      const data = await this.getRealtyData(searchParams);
      
      if (!data?.data?.home_search?.results) {
        console.log('No properties found in initial search');
        return [];
      }

      let properties = await Promise.all(
        data.data.home_search.results.map(async (property: BasicProperty) => {
          return await this.mergePropertyData(property);
        })
      );

      console.log(`Initial properties: ${properties.length}`);

      // First, filter out properties without required fields
      properties = properties.filter(prop => {
        const hasRequiredFields = 
          prop.photoUrl && // Must have an image
          prop.address &&  // Must have address
          prop.city &&     // Must have city
          prop.state &&    // Must have state
          prop.price &&    // Must have price
          prop.propertyDetails.bedrooms !== 'N/A' && // Must have bedroom count
          prop.propertyDetails.bathrooms !== 'N/A' && // Must have bathroom count
          prop.sqft > 0;   // Must have square footage

        if (!hasRequiredFields) {
          console.log(`Removed incomplete property: ${prop.address} - Missing required fields`);
        }
        return hasRequiredFields;
      });

      console.log(`After required fields filter: ${properties.length} properties`);

      // Apply mandatory filters (location and price)
      if (searchParams.priceRange?.min || searchParams.priceRange?.max) {
        const min = searchParams.priceRange?.min || 0;
        const max = searchParams.priceRange?.max || Infinity;
        properties = properties.filter(prop => {
          const matches = prop.price >= min && prop.price <= max;
          if (!matches) {
            console.log(`Price filter removed: ${prop.address} - $${prop.price} (not in range $${min}-$${max})`);
          }
          return matches;
        });
      }

      const filterMessages: string[] = [];

      // Apply optional filters with feedback
      if (properties.length > 0) {
        // Optional: Square footage filter
        if (searchParams.sqftRange?.min || searchParams.sqftRange?.max) {
          const min = searchParams.sqftRange?.min || 0;
          const max = searchParams.sqftRange?.max || Infinity;
          
          const sqftFiltered = properties.filter(prop => prop.sqft >= min && prop.sqft <= max);
          
          if (sqftFiltered.length === 0) {
            filterMessages.push(`No properties found within ${min}-${max} sq ft range. Try expanding your search.`);
          } else {
            properties = sqftFiltered;
          }
        }

        // Optional: Property type filter
        if (searchParams.propertyType && searchParams.propertyType !== '') {
          const typeFiltered = properties.filter(prop => 
            prop.propertyType.toLowerCase() === searchParams.propertyType?.toLowerCase()
          );
          
          if (typeFiltered.length === 0) {
            filterMessages.push(`No ${searchParams.propertyType} properties found. Showing all property types.`);
          } else {
            properties = typeFiltered;
          }
        }

        // Optional: Bedrooms filter
        if (searchParams.bedrooms && searchParams.bedrooms !== '') {
          const requestedBeds = parseInt(searchParams.bedrooms);
          const bedsFiltered = properties.filter(prop => {
            const beds = parseInt(prop.propertyDetails.bedrooms);
            return requestedBeds === 5 ? beds >= 5 : beds === requestedBeds;
          });

          if (bedsFiltered.length === 0) {
            filterMessages.push(`No properties found with ${requestedBeds} bedrooms. Showing all bedroom counts.`);
          } else {
            properties = bedsFiltered;
          }
        }

        // Optional: Bathrooms filter
        if (searchParams.bathrooms && searchParams.bathrooms !== '') {
          const requestedBaths = parseFloat(searchParams.bathrooms);
          const bathsFiltered = properties.filter(prop => {
            const baths = parseFloat(prop.propertyDetails.bathrooms);
            return requestedBaths === 4 ? baths >= 4 : baths === requestedBaths;
          });

          if (bathsFiltered.length === 0) {
            filterMessages.push(`No properties found with ${requestedBaths} bathrooms. Showing all bathroom counts.`);
          } else {
            properties = bathsFiltered;
          }
        }
      }

      console.log(`Final filtered properties: ${properties.length}`);
      if (filterMessages.length > 0) {
        console.log('Filter messages:', filterMessages);
      }

      return properties;
    } catch (error) {
      console.error('Error in searchProperties:', error);
      return [];
    }
  }
}
