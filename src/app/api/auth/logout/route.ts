import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Delete the token cookie by setting it to expire immediately
    cookieStore.delete('token');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
