import { PropertyService } from '@/services/propertyService';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const searchParams = await req.json();
    const propertyService = new PropertyService();
    
    // Validate required fields
    if (!searchParams.city || !searchParams.state) {
      return NextResponse.json(
        { error: 'City and state are required' },
        { status: 400 }
      );
    }

    const properties = await propertyService.searchProperties(searchParams);
    return NextResponse.json({ properties });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
