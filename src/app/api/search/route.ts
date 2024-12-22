import { NextResponse } from 'next/server';

const MOCK_PROPERTIES = [
  {
    id: "mock1",
    address: "123 Main St, Los Angeles, CA",
    price: 2500000,
    propertyType: "Office",
    sqft: 5000,
    yearBuilt: 1995,
    capRate: "6.2%",
    pricePerSqFt: 500,
    lotSize: "0.5 acres",
    description: "Class A office building in prime downtown location. Recently renovated with modern amenities including fiber optic connectivity, updated HVAC, and secure parking garage. Strong tenant mix with 95% occupancy.",
    highlights: [
      "Recently renovated lobby and common areas",
      "On-site parking (ratio 3:1,000)",
      "24/7 security",
      "Walking distance to transit",
      "Long-term tenants with staggered lease expirations"
    ],
    propertyDetails: {
      parking: "150 spaces (3 per 1,000 SF)",
      floors: 3,
      zoning: "C-2 Commercial",
      tenancy: "Multi-tenant",
      occupancy: "95%",
      construction: "Steel and glass",
      utilities: "All separately metered"
    }
  },
  {
    id: "mock2",
    address: "456 Market St, Los Angeles, CA",
    price: 3800000,
    propertyType: "Retail",
    sqft: 7500,
    yearBuilt: 2005,
    capRate: "5.8%",
    pricePerSqFt: 507,
    lotSize: "0.75 acres",
    description: "Premium retail center anchored by national credit tenant. High-traffic location with excellent visibility and recent exterior improvements. Triple net leases with minimal landlord responsibilities.",
    highlights: [
      "100% occupied with national and regional tenants",
      "High-traffic corner location",
      "Recently upgraded facade",
      "Additional pad site available for development",
      "Strong demographic indicators in 3-mile radius"
    ],
    propertyDetails: {
      parking: "225 spaces (4 per 1,000 SF)",
      floors: 1,
      zoning: "CR Commercial Retail",
      tenancy: "Multi-tenant",
      occupancy: "100%",
      construction: "Masonry",
      utilities: "NNN leases"
    }
  },
  {
    id: "mock3",
    address: "789 Commerce Ave, Los Angeles, CA",
    price: 5200000,
    propertyType: "Industrial",
    sqft: 12000,
    yearBuilt: 2015,
    capRate: "7.1%",
    pricePerSqFt: 433,
    lotSize: "1.2 acres",
    description: "Modern distribution facility with excellent access to major highways. Features include 24' clear height, ESFR sprinklers, and multiple dock-high doors. Fully leased to credit tenant.",
    highlights: [
      "ESFR sprinkler system",
      "6 dock-high doors",
      "2 grade-level doors",
      "Recently expanded truck court",
      "Long-term lease with annual increases"
    ],
    propertyDetails: {
      parking: "45 spaces + truck court",
      clearHeight: "24 feet",
      zoning: "M-1 Light Industrial",
      tenancy: "Single-tenant",
      occupancy: "100%",
      construction: "Tilt-up concrete",
      utilities: "Industrial power"
    }
  },
  {
    id: "mock4",
    address: "321 Plaza Dr, Los Angeles, CA",
    price: 4100000,
    propertyType: "Mixed Use",
    sqft: 8200,
    yearBuilt: 2018,
    capRate: "5.5%",
    pricePerSqFt: 500,
    lotSize: "0.3 acres",
    description: "Modern mixed-use property featuring ground-floor retail with luxury apartments above. Located in rapidly developing urban corridor with strong rental demand.",
    highlights: [
      "Ground floor retail fully leased",
      "High-end residential units",
      "Rooftop amenity deck",
      "Secure underground parking",
      "Green building certification pending"
    ],
    propertyDetails: {
      parking: "Underground garage - 32 spaces",
      floors: 4,
      zoning: "MU-2 Mixed Use",
      tenancy: "Multi-tenant",
      occupancy: "98%",
      construction: "Modern steel frame",
      utilities: "Separately metered"
    }
  },
  {
    id: "mock5",
    address: "555 Tower Blvd, Los Angeles, CA",
    price: 6500000,
    propertyType: "Office",
    sqft: 15000,
    yearBuilt: 2010,
    capRate: "6.5%",
    pricePerSqFt: 433,
    lotSize: "0.8 acres",
    description: "Class A suburban office campus with excellent accessibility. Recently upgraded with modern amenities and energy-efficient systems. Strong historical occupancy with diverse tenant mix.",
    highlights: [
      "Energy Star certified",
      "On-site fitness center",
      "Conference facility",
      "Abundant surface parking",
      "Flexible floor plates"
    ],
    propertyDetails: {
      parking: "225 spaces (4 per 1,000 SF)",
      floors: 3,
      zoning: "O-1 Office",
      tenancy: "Multi-tenant",
      occupancy: "92%",
      construction: "Steel frame with glass curtain wall",
      utilities: "Central HVAC"
    }
  }
];

export async function POST(req: Request) {
  try {
    // Use mock data if in development or if API key is not available
    if (process.env.NODE_ENV === 'development' || !process.env.RAPID_API_KEY) {
      const { city, state } = await req.json();
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({ 
        properties: MOCK_PROPERTIES.map(prop => ({
          ...prop,
          address: prop.address.replace('Los Angeles, CA', `${city}, ${state}`)
        }))
      });
    }

    // Otherwise use the real API
    // ... rest of your original API code ...
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}
