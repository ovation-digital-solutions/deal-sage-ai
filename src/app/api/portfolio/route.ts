import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all properties for the current user
    const result = await pool.query(
      `SELECT id, address, purchase_price, current_value, purchase_date, notes 
       FROM portfolios 
       WHERE user_id = $1 
       ORDER BY purchase_date DESC`,
      [token]
    );

    return NextResponse.json({
      success: true,
      properties: result.rows
    });

  } catch (error) {
    console.error('Portfolio fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}
