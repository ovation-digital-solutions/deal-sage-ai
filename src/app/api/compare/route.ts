import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Property } from '@/types/property';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { properties }: { properties: Property[] } = await req.json();
    
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
    console.error('Comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare properties' },
      { status: 500 }
    );
  }
}
