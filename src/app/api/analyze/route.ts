import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '../../../lib/db';

// Helper function to check analysis limit
const checkAnalysisLimit = async (userId: string) => {
  const result = await pool.query(
    'SELECT analysis_count, is_premium FROM users WHERE id = $1',
    [userId]
  );
  
  const user = result.rows[0];
  if (!user.is_premium && user.analysis_count >= 3) {
    throw new Error('Analysis limit reached');
  }
};

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has reached their analysis limit
    await checkAnalysisLimit(token);
    
    // Your existing analysis logic here
    
    // After successful analysis, increment the count
    await fetch('/api/analyze/increment', { 
      method: 'POST',
      headers: {
        Cookie: `token=${token}`
      }
    });

    // Return your analysis results
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Analysis limit reached') {
      return NextResponse.json(
        { error: 'Please upgrade to continue analyzing properties' },
        { status: 403 }
      );
    }
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
