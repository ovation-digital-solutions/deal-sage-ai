import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { cookies } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log the price ID to debug
    console.log('Price ID:', process.env.STRIPE_PRICE_ID);

    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error('Missing STRIPE_PRICE_ID environment variable');
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,  // Using environment variable
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/upgrade?canceled=true`,
      client_reference_id: token,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Full error:', error);
    return NextResponse.json(
      { error: 'Error creating checkout session', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
