import { NextResponse } from 'next/server';
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { PropertyData } from '@/types/property';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface AnalyzeRequestBody {
  propertyId: string;
}

interface LoopNetPropertyDetail {
  price: {
    amount: number;
  };
  building: {
    units: {
      totalUnits: number;
    };
    bathrooms: number;
    size: {
      amount: number;
    };
  };
  address: {
    streetAddress: string;
    city: string;
    state: string;
  };
}

export async function POST(req: Request) {
  try {
    const { propertyId }: AnalyzeRequestBody = await req.json();

    // Fetch detailed property data from LoopNet API using propertyId
    const propertyData = await fetchPropertyDetails(propertyId);
    
    // Analyze with Claude
    const analysis = await analyzeWithClaude(propertyData);

    return NextResponse.json({ propertyData, analysis });
  } catch (error) {
    console.error('Error in analyze:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze property';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function fetchPropertyDetails(propertyId: string): Promise<PropertyData> {
  const options = {
    method: 'GET',
    url: `https://loopnet.p.rapidapi.com/properties/${propertyId}`,
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'loopnet.p.rapidapi.com'
    }
  };

  const response = await axios.request<LoopNetPropertyDetail>(options);
  console.log('Property details response:', response.data);
  
  return {
    price: response.data.price?.amount || 0,
    beds: response.data.building?.units?.totalUnits || 0,
    baths: response.data.building?.bathrooms || 0,
    sqft: response.data.building?.size?.amount || 0,
    address: `${response.data.address.streetAddress}, ${response.data.address.city}, ${response.data.address.state}`,
  };
}

async function analyzeWithClaude(propertyData: PropertyData): Promise<string> {
  const message = `Please analyze this commercial real estate investment opportunity:
  
Property Details:
- Price: $${propertyData.price.toLocaleString()}
- Total Units: ${propertyData.beds}
- Bathrooms: ${propertyData.baths}
- Square Feet: ${propertyData.sqft.toLocaleString()}
- Location: ${propertyData.address}

Please provide:
1. A brief investment analysis
2. Estimated cap rate and cash on cash return
3. Potential risks and opportunities
4. Overall recommendation

Keep the response concise and focused on key commercial real estate investment factors.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: message,
    }],
  });

  const firstContent = response.content[0];
  
  if (firstContent.type === 'text') {
    return firstContent.text;
  }

  throw new Error('Unexpected response format from Claude');
}
