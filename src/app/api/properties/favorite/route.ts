import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get user ID from token
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(token);

    const result = await pool.query(
      'SELECT property_data FROM favorite_properties WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({ 
      properties: result.rows.map(row => row.property_data)
    });

  } catch (err) {
    console.error('Fetch favorites error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(token);
    const propertyData = await req.json();
    
    // Construct web_url if it's not present
    if (!propertyData.web_url) {
      const formattedAddress = propertyData.address
        ?.replace(/Unit.*|Apt.*|#.*$/i, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      
      const formattedCity = propertyData.city?.replace(/\s+/g, '-') || '';
      const stateCode = propertyData.state;
      const propertyId = propertyData.id;

      propertyData.web_url = `https://www.realtor.com/realestateandhomes-detail/${formattedAddress}_${formattedCity}_${stateCode}_${propertyId}`;
    }

    // Make sure we have required fields
    if (!propertyData.id) {
      return NextResponse.json(
        { error: 'Missing property identifier' },
        { status: 400 }
      );
    }

    // Use property_id as identifier for consistency
    const propertyId = propertyData.id;

    // Check if property already exists in favorites
    const existingResult = await pool.query(
      'SELECT id FROM favorite_properties WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    if (existingResult.rows.length === 0) {
      await pool.query(
        'INSERT INTO favorite_properties (user_id, property_id, property_data) VALUES ($1, $2, $3)',
        [userId, propertyId, propertyData]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Save favorite error details:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to save to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Get propertyId from URL
    const url = new URL(request.url);
    const propertyId = url.searchParams.get('id');

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(token);

    const result = await pool.query(
      'DELETE FROM favorite_properties WHERE user_id = $1 AND property_id = $2 RETURNING *',
      [userId, propertyId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Property not found in favorites' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete favorite error:', err);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
