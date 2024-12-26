'use client';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsAuthenticated, setUser } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setIsAuthenticated(true);
      setUser(data.user);
      
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="text-red-400 text-center text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-transparent transition-all"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-3 text-sm font-medium rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
      >
        Sign in
      </button>

      <p className="text-center text-sm text-slate-400">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-y-0 -left-4 w-1/3 bg-gradient-to-r from-emerald-600 to-emerald-400 blur-3xl transform -skew-x-12" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-emerald-900 to-transparent blur-3xl transform skew-x-12" />
      </div>

      <div className="relative z-10 max-w-md w-full p-8 space-y-8">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center justify-center space-y-1 mb-4">
          <Link 
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-clip-text text-transparent"
          >
            MERIDEX AI
          </Link>
          <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Sign in to your account
          </h2>

          <Suspense fallback={
            <div className="text-center text-slate-400">
              Loading...
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
