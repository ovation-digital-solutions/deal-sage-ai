import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '../../../../lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log('Auth check - token:', token);

    // If no token, return not authenticated
    if (!token) {
      console.log('Auth check - no token found');
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null 
      });
    }

    // Token contains user ID in this case
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE id = $1',
      [token]
    );

    const user = result.rows[0];
    
    // If no user found, return not authenticated
    if (!user) {
      console.log('Auth check - no user found for token');
      return NextResponse.json({ 
        isAuthenticated: false,
        user: null 
      });
    }

    const response = {
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    };

    console.log('Auth check - successful response:', response);
    return NextResponse.json(response);

  } catch (err) {
    console.error('Auth check error:', err);
    return NextResponse.json({ 
      isAuthenticated: false,
      user: null 
    });
  }
}
