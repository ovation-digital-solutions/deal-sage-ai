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

function formatResponse(text: string): string {
  // Clean and standardize the text
  const cleanText = text
    .replace(/^[•\-]\s*/gm, '') // Remove existing bullets
    .replace(/^\d+[\.\)]\s*/gm, '') // Remove numbered lists
    .replace(/\s*[\-–]\s*/g, ': ') // Replace dashes with colons
    .replace(/\([^)]*\)/g, match => match.replace(/\s+/g, ' ')); // Clean up parentheses
  
  // Split into meaningful segments and clean up
  const points = cleanText
    .split(/(?<=[.!?])\s+(?=[A-Z])/) // Split on sentence boundaries
    .map(point => point.trim())
    .filter(point => point.length > 10) // Remove very short segments
    .filter((_, index) => index < 3); // Limit to 3 key points

  // Format with clean bullet points
  return points
    .map(point => `• ${point}`)
    .join('\n');
}

export async function POST(req: Request) {
  try {
    const { message, context, properties } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a helpful real estate analysis assistant. Keep responses brief and focused, using 2-3 bullet points maximum. Use the following context about previously analyzed properties to help answer the user's question:

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
      max_tokens: 150,
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

    const formattedResponse = formatResponse(firstContent.text);

    return NextResponse.json({ response: formattedResponse });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
