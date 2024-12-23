import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    // TODO: Get actual user_id from session
    const userId = 1; // Temporary! Replace with actual user ID from session

    const result = await pool.query(
      'SELECT property_data FROM saved_properties WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return NextResponse.json({ 
      properties: result.rows.map(row => row.property_data)
    });

  } catch (err) {
    console.error('Fetch saved properties error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch saved properties' },
      { status: 500 }
    );
  }
}
