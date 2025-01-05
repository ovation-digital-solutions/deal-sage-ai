import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '../../../../lib/db';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await pool.query(
      `UPDATE users 
       SET analysis_count = analysis_count + 1 
       WHERE id = $1 
       RETURNING analysis_count, is_premium`,
      [token]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error incrementing analysis count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
