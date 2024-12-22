import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received property data:', body);

    const propertyData = {
      propertyId: body.id || 'N/A',
      propertyType: body.propertyType || 'Property',
      price: Number(body.price) || 0,
      sqft: Number(body.sqft) || 0,
      lotSize: body.lotSize || 'N/A',
      yearBuilt: body.yearBuilt || 'N/A',
      address: body.address || 'N/A',
      description: body.description || 'No description available',
      propertyDetails: body.propertyDetails || {}
    };

    console.log('Formatted property data:', propertyData);

    const message = `Please analyze this ${propertyData.propertyType} property:

Property Details:
- Address: ${propertyData.address}
- Type: ${propertyData.propertyType}
- Price: $${propertyData.price.toLocaleString()}
- Square Footage: ${propertyData.sqft.toLocaleString()} sq ft
- Lot Size: ${propertyData.lotSize}
- Year Built: ${propertyData.yearBuilt}
- Bedrooms: ${propertyData.propertyDetails.bedrooms || 'N/A'}
- Bathrooms: ${propertyData.propertyDetails.bathrooms || 'N/A'}
- Parking: ${propertyData.propertyDetails.parking || 'N/A'}
- Construction: ${propertyData.propertyDetails.construction || 'N/A'}
- Zoning: ${propertyData.propertyDetails.zoning || 'N/A'}

Property Description:
${propertyData.description}

Please provide:
1. Market Analysis
   - Current market conditions
   - Price comparison with similar properties
   - Location value factors

2. Investment Potential
   - Potential return on investment
   - Rental income potential (if applicable)
   - Value appreciation outlook
   ${propertyData.propertyType.toLowerCase() === 'commercial' ? '- Estimated cap rate analysis' : ''}

3. Property Assessment
   - Condition analysis based on age and features
   - Key advantages and unique selling points
   - Potential renovation or improvement needs

4. Risk Factors
   - Market-specific risks
   - Property-specific concerns
   - Economic considerations

5. Overall Recommendation
   - Buy/Hold/Pass recommendation
   - Key decision factors
   - Additional considerations

Please keep the analysis concise and focused on the most relevant factors for this type of property.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: message,
      }],
    });

    const firstContent = response.content[0];
    
    if (firstContent.type === 'text') {
      return NextResponse.json({ analysis: firstContent.text });
    }

    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    console.error('Error in analyze:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze property' },
      { status: 500 }
    );
  }
}
