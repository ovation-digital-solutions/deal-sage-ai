import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import pool from '../../../../lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create the response object
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

    // Set the cookie in the response
    response.cookies.set({
      name: 'token',
      value: user.id.toString(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    console.log('Login - Setting cookie with token:', user.id.toString());
    return response;

  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
