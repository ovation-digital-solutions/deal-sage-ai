import { PropertyService } from '@/services/propertyService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { city, state } = await req.json();
    const propertyService = new PropertyService();
    
    const properties = await propertyService.searchProperties(city, state);
    return NextResponse.json({ properties });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
