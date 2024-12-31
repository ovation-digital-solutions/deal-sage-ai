import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

interface Property {
  address: string;
  price: number;
  sqft: number;
  propertyDetails?: {
    bedrooms: number;
    bathrooms: number;
  };
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const { message, context, properties } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a helpful real estate analysis assistant. Use the following context about previously analyzed properties to help answer the user's question:

Context:
${context}

Property Details:
${properties.map((p: Property, i: number) => `
Property ${i + 1}:
- Address: ${p.address}
- Price: $${p.price?.toLocaleString()}
- Size: ${p.sqft?.toLocaleString()} sqft
${p.propertyDetails ? `- Bedrooms: ${p.propertyDetails.bedrooms}
- Bathrooms: ${p.propertyDetails.bathrooms}` : ''}
`).join('\n')}

Please provide specific, relevant answers based on this information.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [
        { role: 'assistant', content: systemPrompt },
        { role: 'user', content: message }
      ],
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
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
