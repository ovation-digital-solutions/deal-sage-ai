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

    const message = `Compare these properties concisely:
    
${properties.map((p, i) => `
Property ${i + 1}:
- Address: ${p.address}
- Price: $${p.price?.toLocaleString()}
- Size: ${p.sqft?.toLocaleString()} sqft
- Bedrooms: ${p.propertyDetails?.bedrooms}
- Bathrooms: ${p.propertyDetails?.bathrooms}
`).join('\n')}

Provide a focused analysis with:
1. Price Comparison: Include price per sqft and overall value assessment
2. Key Features: Compare size, bedrooms, bathrooms, and any standout differences
3. Investment Perspective: Brief assessment of potential value or opportunities
4. Quick Recommendation: Which property might be better and why

Keep each section to 2-3 clear points. Focus on actionable insights and meaningful differences.`;

    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 600,
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
