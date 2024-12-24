import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    // TODO: Get actual user_id from session
    const userId = 1; // Temporary! Replace with actual user ID from session

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

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const propertyId = url.pathname.split('/').pop();
    const userId = 1; // TODO: Get from session

    await pool.query(
      'DELETE FROM favorite_properties WHERE user_id = $1 AND property_id = $2',
      [userId, propertyId]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete favorite error:', err);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
