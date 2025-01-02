import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Get token from cookies (matches your auth/check route)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database using token (which is the user ID in your system)
    const userResult = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [token]
    );

    if (!userResult.rows[0]) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = userResult.rows[0].id;
    const data = await request.json();
    const { properties } = data;

    // Validate the properties data
    if (!Array.isArray(properties)) {
      return NextResponse.json({ error: 'Invalid properties data' }, { status: 400 });
    }

    // Modified query construction
    let parameterCount = 1;
    const queryValues: (string | number | Date | null)[] = [];
    const valueStrings = properties.map(property => {
      queryValues.push(
        userId,
        property.address,
        property.purchase_price,
        property.current_value,
        property.purchase_date,
        property.notes || null
      );
      const indices = [
        parameterCount++,
        parameterCount++,
        parameterCount++,
        parameterCount++,
        parameterCount++,
        parameterCount++
      ];
      return `($${indices.join(', $')})`;
    });

    const query = {
      text: `
        INSERT INTO portfolios 
        (user_id, address, purchase_price, current_value, purchase_date, notes)
        VALUES ${valueStrings.join(',')}
        RETURNING *
      `,
      values: queryValues
    };

    const result = await pool.query(query);

    return NextResponse.json({
      success: true,
      properties: result.rows
    });

  } catch (error) {
    console.error('Portfolio upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload portfolio' },
      { status: 500 }
    );
  }
}
