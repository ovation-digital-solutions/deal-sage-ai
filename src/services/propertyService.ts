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

  private async getRealtyData(city: string, state: string): Promise<PropertySearchResponse> {
    const stateCode = this.getStateCode(state);
    console.log(`Converting state "${state}" to state code: ${stateCode}`);

    const options = {
      method: 'POST',
      url: `https://${this.rapidApiHost}/properties/v3/list`,
      headers: {
        'content-type': 'application/json',
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': this.rapidApiHost
      },
      data: {
        limit: 4,
        offset: 0,
        city: city,
        state_code: stateCode,
        status: ['for_sale'],
        sort: {
          direction: 'desc',
          field: 'list_date'
        },
        filters: {
          property_type: ['commercial', 'multi_family', 'industrial', 'retail']
        }
      }
    };

    const response = await axios.request(options);
    return response.data;
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

  public async searchProperties(city: string, state: string): Promise<Property[]> {
    try {
      const data = await this.getRealtyData(city, state);
      console.log('Initial properties response:', data);

      if (!data?.data?.home_search?.results) {
        console.log('No properties found in search results');
        return [];
      }

      const properties = await Promise.all(
        data.data.home_search.results.map(async (property: BasicProperty) => {
          return await this.mergePropertyData(property);
        })
      );

      return properties;
    } catch (error) {
      console.error('Error in searchProperties:', error);
      return [];
    }
  }
}
