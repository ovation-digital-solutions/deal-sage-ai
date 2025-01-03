import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Export interfaces so they can be used in other files
export interface PortfolioProperty {
  id: string;
  address: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  notes?: string;
}

export interface ComparisonProperty {
  id: string;
  address: string;
  price: number;
  sqft: number;
  propertyDetails?: {
    bedrooms: number;
    bathrooms: number;
  };
}

export interface RequestBody {
  chatMessage: string;
  portfolioProperties: PortfolioProperty[];
  comparisonProperties: ComparisonProperty[];
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { chatMessage, portfolioProperties, comparisonProperties }: RequestBody = await req.json();

    const systemPrompt = `You are a real estate analysis assistant. Compare the following properties with the user's portfolio properties. 

Structure your response in 3 short bullet points covering:
• Key Differences: Compare size, price, and features vs portfolio
• Market Position: How these properties fit with current portfolio
• Quick Recommendation: One clear action item

Keep each bullet point to 1-2 lines maximum. Be direct and specific.

Portfolio Properties:
${portfolioProperties.map((p, i) => `
Property ${i + 1}:
- Address: ${p.address}
- Purchase Price: $${p.purchase_price?.toLocaleString()}
- Current Value: $${p.current_value?.toLocaleString()}
- Purchase Date: ${new Date(p.purchase_date).toLocaleDateString()}
${p.notes ? `- Notes: ${p.notes}` : ''}
`).join('\n')}

Properties Being Compared:
${comparisonProperties.map((p, i) => `
Property ${i + 1}:
- Address: ${p.address}
- Price: $${p.price?.toLocaleString()}
- Size: ${p.sqft?.toLocaleString()} sqft
- Bedrooms: ${p.propertyDetails?.bedrooms}
- Bathrooms: ${p.propertyDetails?.bathrooms}
`).join('\n')}

Previous Analysis Context:
${chatMessage}`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: systemPrompt,
      }],
    });

    const firstContent = response.content[0];
    
    if (!firstContent || firstContent.type !== 'text') {
      return NextResponse.json(
        { error: 'Invalid response format from AI service' },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: firstContent.text });

  } catch (error) {
    console.error('Portfolio comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare with portfolio' },
      { status: 500 }
    );
  }
}
