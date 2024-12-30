import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '../../../lib/db';

// Get analyses for a user
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      `SELECT id, property_data, analysis_text, created_at 
       FROM property_analyses 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [token]
    );

    // Parse the property_data JSONB field
    const analyses = result.rows.map(row => ({
      ...row,
      property_data: Array.isArray(row.property_data) ? row.property_data : JSON.parse(row.property_data)
    }));

    return NextResponse.json({ analyses });

  } catch (err) {
    console.error('Fetch analyses error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}

// Save a new analysis
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

    const { properties, analysisText } = await req.json();

    const result = await pool.query(
      `INSERT INTO property_analyses (user_id, property_data, analysis_text)
       VALUES ($1, $2::jsonb, $3)
       RETURNING id`,
      [token, JSON.stringify(properties), analysisText]
    );

    return NextResponse.json({ 
      success: true,
      analysisId: result.rows[0].id
    });

  } catch (err) {
    console.error('Save analysis error:', err);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}
