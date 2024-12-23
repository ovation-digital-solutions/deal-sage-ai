import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export async function GET() {
  try {
    // TODO: Get user ID from session
    // For now, return the first user (this should be updated with proper session handling)
    const result = await pool.query('SELECT id, name, email FROM users LIMIT 1');
    
    if (result.rows[0]) {
      return NextResponse.json({ user: result.rows[0] });
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
