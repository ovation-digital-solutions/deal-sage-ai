import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Property } from '@/types/property';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY);
    
    if (!req.body) {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 }
      );
    }

    const { properties }: { properties: Property[] } = await req.json();

    if (!Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json(
        { error: 'Properties array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not configured');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const message = `Please compare these properties and provide insights:
    
${properties.map((p, i) => `
Property ${i + 1}:
- Address: ${p.address}
- Price: $${p.price?.toLocaleString()}
- Size: ${p.sqft?.toLocaleString()} sqft
- Bedrooms: ${p.propertyDetails?.bedrooms}
- Bathrooms: ${p.propertyDetails?.bathrooms}
`).join('\n')}

Please provide:
1. Price Comparison
2. Value Analysis
3. Key Differences
4. Investment Potential
5. Recommendation

Keep the analysis concise and focused on the most important factors.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: message,
        }],
      });

      const firstContent = response.content[0];
      
      if (!firstContent || firstContent.type !== 'text') {
        console.error('Invalid response format:', response);
        return NextResponse.json(
          { error: 'Invalid response format from AI service' },
          { status: 500 }
        );
      }

      return NextResponse.json({ analysis: firstContent.text });

    } catch (apiError) {
      console.error('Anthropic API error:', apiError);
      return NextResponse.json(
        { error: 'AI service error', details: apiError instanceof Error ? apiError.message : String(apiError) },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Comparison error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compare properties',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
