'use client';

import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function UpgradePage() {
  const searchParams = useSearchParams();
  const fromLimit = searchParams.get('fromLimit');

  const handleSubscribe = async () => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-y-0 -left-4 w-1/3 bg-gradient-to-r from-emerald-600 to-emerald-400 blur-3xl transform -skew-x-12" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-emerald-900 to-transparent blur-3xl transform skew-x-12" />
      </div>

      <div className="relative z-10 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center justify-center space-y-1 mb-4">
          <Link 
            href="/"
            className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-clip-text text-transparent"
          >
            MERIDEX AI
          </Link>
          <div className="h-1 w-12 sm:w-16 md:w-20 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 md:p-8">
          {fromLimit && (
            <div className="mb-6 p-4 bg-slate-900/50 border border-emerald-500/20 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-emerald-400">
                    You&apos;ve reached your free analysis limit. Upgrade to continue analyzing properties!
                  </p>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
            Upgrade to Premium
          </h2>

          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-emerald-400">Premium Features</h3>
              <ul className="space-y-3 text-slate-300">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Unlimited property analyses
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced market insights
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-emerald-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Export reports to PDF
                </li>
              </ul>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$20</div>
              <div className="text-slate-400 text-sm">per month</div>
            </div>

            <button
              onClick={handleSubscribe}
              className="w-full px-4 py-2 sm:py-3 text-sm sm:text-base font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
