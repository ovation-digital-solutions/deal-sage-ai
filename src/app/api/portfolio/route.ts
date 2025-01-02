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

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const { id } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await pool.query(
      'DELETE FROM property_analyses WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, token]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete portfolio property error:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, address, purchase_price, current_value, purchase_date, notes } = await req.json();

    const result = await pool.query(
      `UPDATE portfolios 
       SET address = $1, purchase_price = $2, current_value = $3, 
           purchase_date = $4, notes = $5
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [address, purchase_price, current_value, purchase_date, notes, id, token]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      property: result.rows[0]
    });

  } catch (error) {
    console.error('Update portfolio property error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}
