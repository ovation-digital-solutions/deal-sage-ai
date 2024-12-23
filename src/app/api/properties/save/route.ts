import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(req: Request) {
  try {
    const { propertyId, propertyData } = await req.json();
    
    // TODO: Get actual user_id from session
    const userId = 1; // Temporary! Replace with actual user ID from session

    const result = await pool.query(
      'INSERT INTO saved_properties (user_id, property_id, property_data) VALUES ($1, $2, $3) RETURNING id',
      [userId, propertyId, propertyData]
    );

    return NextResponse.json({ 
      success: true, 
      savedPropertyId: result.rows[0].id 
    });

  } catch (err) {
    console.error('Save property error:', err);
    return NextResponse.json(
      { error: 'Failed to save property' },
      { status: 500 }
    );
  }
}
