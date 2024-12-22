import axios from 'axios';

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
}

interface PropertyFlags {
  is_new_listing?: boolean;
}

interface PropertyFinancial {
  cap_rate?: number;
}

interface BasicProperty {
  property_id: string;
  location: PropertyLocation;
  list_price: number;
  description?: PropertyDescription;
  features?: PropertyFeature[];
  flags?: PropertyFlags;
  financial?: PropertyFinancial;
  listing?: {
    sqft?: number;
    year_built?: number;
    prop_type?: string;
    description?: string;
  };
}

interface DetailedData {
  data?: {
    home?: {
      details?: Array<{
        category: string;
        text: string[];
      }>;
      property_history?: Array<{
        date: string;
        event_name: string;
        price: number;
        source_name: string;
      }>;
      last_sold_date?: string;
      last_sold_price?: number;
      description?: {
        sqft?: number;
        text?: string;
        year_built?: number;
      };
      features?: Array<{
        category: string;
        text: string[];
      }>;
    };
  };
}

interface PropertySearchResponse {
  data: {
    home_search: {
      results: BasicProperty[];
    };
  };
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
}

export class PropertyService {
  private readonly rapidApiKey: string;
  private readonly rapidApiHost: string;

  constructor() {
    this.rapidApiKey = process.env.RAPID_API_KEY || '';
    this.rapidApiHost = 'realty-in-us.p.rapidapi.com';
  }

  private async getRealtyData(city: string, state: string): Promise<PropertySearchResponse> {
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
        state_code: state,
        status: ['for_sale'],
        sort: {
          direction: 'desc',
          field: 'list_date'
        },
        filters: {
          property_type: ['commercial', 'multi_family', 'industrial', 'retail']
        },
        include: [
          "property_id",
          "list_price",
          "location",
          "description",
          "property_type",
          "photos",
          "flags",
          "community",
          "building_size",
          "lot_size",
          "raw_products",
          "tax_history",
          "history",
          "units",
          "features",
          "client_display_flags",
          "lead_attributes",
          "tax_history"
        ]
      }
    };

    const response = await axios.request(options);
    return response.data;
  }

  async searchProperties(city: string, state: string) {
    try {
      const initialProperties = await this.getRealtyData(city, state);
      
      const enrichedProperties = await Promise.all(
        initialProperties.data.home_search.results.map(async (property: BasicProperty) => {
          const details = await this.getPropertyDetails(property.property_id);
          return this.mergePropertyData(property, details);
        })
      );

      return enrichedProperties;
    } catch (error) {
      console.error('Error fetching property data:', error);
      throw error;
    }
  }

  private async getPropertyDetails(propertyId: string): Promise<DetailedData | null> {
    const options = {
      method: 'GET',
      url: `https://${this.rapidApiHost}/properties/v3/detail`,
      params: {
        property_id: propertyId
      },
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': this.rapidApiHost
      }
    };

    try {
      const response = await axios.request(options);
      console.log(`Detail Response for property ${propertyId}:`, JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch details for property ${propertyId}:`, error);
      return null;
    }
  }

  private mergePropertyData(basicProperty: BasicProperty, detailedData: DetailedData | null): MergedPropertyData {
    const home = detailedData?.data?.home || {};
    const details = home.details || [];
    
    // Enhanced findFeature that can return multiple values from text array
    const findFeature = (categories: string[], startsWith?: string): string | undefined => {
      for (const category of categories) {
        const detail = details.find(d => 
          d.category?.toLowerCase() === category.toLowerCase()
        );
        if (detail?.text?.length) {
          if (startsWith) {
            const match = detail.text.find(t => t.startsWith(startsWith));
            if (match) return match;
          }
          return detail.text[0];
        }
      }
      return undefined;
    };

    // Type the extracted values
    const bedrooms: string = findFeature(['Bedrooms'], 'Bedrooms:')?.split(': ')[1] || 'N/A';
    const bathrooms: string = findFeature(['Bathrooms'], 'Full Bathrooms:')?.split(': ')[1] || 'N/A';
    const yearBuilt: string = findFeature(['Building and Construction'], 'Year Built:')?.split(': ')[1] || 'N/A';
    const parking: string = findFeature(['Garage and Parking'], 'Garage Spaces:') || 'N/A';
    const construction: string = findFeature(['Building and Construction'], 'Building Exterior Type:')?.split(': ')[1] || 'N/A';
    const utilities: string[] = details.find(d => d.category === 'Utilities')?.text || [];
    const propertyTax: string = findFeature(['Other Property Info'], 'Annual Tax Amount:')?.split(': ')[1] || 'N/A';

    // Helper function to determine property type
    const getPropertyType = (): string => {
      // Check the property subtype in details first
      const propertySubtype = details.find(d => 
        d.category === 'Other Property Info' && 
        d.text?.some(t => t.startsWith('Source Property Type:'))
      )?.text?.find(t => t.startsWith('Source Property Type:'))?.split(': ')[1];

      if (propertySubtype?.toLowerCase().includes('residential')) {
        return 'Residential';
      }
      if (propertySubtype?.toLowerCase().includes('commercial')) {
        return 'Commercial';
      }

      // Fallback to basic property type
      const basicType = basicProperty.listing?.prop_type?.toLowerCase();
      if (basicType?.includes('single_family') || basicType?.includes('residential')) {
        return 'Residential';
      }
      if (basicType?.includes('commercial')) {
        return 'Commercial';
      }

      // Default fallback
      return 'Residential';
    };

    // Helper function to find lot size
    const getLotSize = (): string => {
      const landInfo = details.find(d => d.category === 'Land Info');
      if (!landInfo?.text) return 'N/A';

      // Try to find lot size in acres first
      const acreSize = landInfo.text.find(t => t.startsWith('Lot Size Acres:'))?.split(': ')[1];
      if (acreSize) return `${acreSize} acres`;

      // Try to find lot size in square feet
      const sqftSize = landInfo.text.find(t => t.startsWith('Lot Size Square Feet:'))?.split(': ')[1];
      if (sqftSize) {
        // Convert square feet to acres if needed
        const acres = (parseInt(sqftSize) / 43560).toFixed(2);
        return `${acres} acres`;
      }

      return 'N/A';
    };

    // Get lot size once to use in multiple places
    const lotSizeValue = getLotSize();

    // Type the property data object
    const propertyData: MergedPropertyData = {
      id: basicProperty.property_id,
      address: `${basicProperty.location.address.line || ''}, ${basicProperty.location.address.city || ''}, ${basicProperty.location.address.state_code || basicProperty.location.address.state || ''}`.trim(),
      price: basicProperty.list_price,
      propertyType: getPropertyType(),
      sqft: home.description?.sqft || basicProperty.listing?.sqft || 0,
      yearBuilt: home.description?.year_built || null,
      capRate: basicProperty.financial?.cap_rate 
        ? `${Number(basicProperty.financial.cap_rate).toFixed(2)}%` 
        : 'N/A',
      pricePerSqFt: basicProperty.list_price && home.description?.sqft
        ? Math.round(basicProperty.list_price / home.description.sqft)
        : null,
      lotSize: lotSizeValue,
      description: home.description?.text || 'No description available',
      highlights: [
        home.description?.year_built && `Year Built: ${home.description.year_built}`,
        basicProperty.flags?.is_new_listing && 'New Listing',
        basicProperty.listing?.prop_type && `Type: ${basicProperty.listing.prop_type}`,
        lotSizeValue !== 'N/A' && `Lot Size: ${lotSizeValue}`
      ].filter((item): item is string => Boolean(item)),
      propertyDetails: {
        parking,
        floors: parseInt(findFeature(['Building and Construction'], 'Levels or Stories:')?.split(': ')[1] || '') || null,
        zoning: findFeature(['Other Property Info'], 'Zoning:')?.split(': ')[1] || 'N/A',
        tenancy: findFeature(['Other Property Info'], 'Property Subtype:')?.split(': ')[1] || 'N/A',
        occupancy: 'N/A',
        construction,
        utilities: utilities.join(', '),
        clearHeight: 'N/A',
        yearBuilt,
        lastSoldDate: home.last_sold_date 
          ? new Date(home.last_sold_date).toLocaleDateString() 
          : 'N/A',
        lastSoldPrice: home.last_sold_price 
          ? `$${home.last_sold_price.toLocaleString()}` 
          : 'N/A',
        lotSize: lotSizeValue,
        bedrooms,
        bathrooms,
        propertyTax: propertyTax ? `$${propertyTax}` : 'N/A'
      }
    };

    // Debug logging
    console.log('Lot Size Value:', lotSizeValue);
    console.log('Property Data:', propertyData);

    return propertyData;
  }
}
