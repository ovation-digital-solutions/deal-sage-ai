'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import MobileNavigation from './MobileNavigation';

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  console.log('Navigation render:', { isAuthenticated, user });

  if (isAuthPage) return null;

  return (
    <header className="w-full z-50 bg-slate-900 border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand */}
          <div className="flex-shrink-0">
            <div className="flex flex-col items-center space-y-1">
              <Link 
                href="/" 
                className="text-xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              >
                MERIDEX AI
              </Link>
              <div className="h-1 w-16 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="
                    px-4 py-2 rounded-lg text-sm font-medium
                    text-slate-300 hover:text-emerald-400
                    transition-all duration-200
                  "
                >
                  Dashboard
                </Link>
                <div key={user?.email} className="text-sm text-slate-400">
                  {user?.email}
                </div>
                <button
                  onClick={logout}
                  className="
                    px-4 py-2 rounded-lg text-sm font-medium
                    text-slate-300 border border-slate-700
                    hover:border-emerald-500/50 hover:text-emerald-400
                    transition-all duration-200
                  "
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="
                    px-4 py-2 rounded-lg text-sm font-medium
                    text-slate-300 hover:text-emerald-400
                    transition-all duration-200
                  "
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="
                    px-4 py-2 rounded-lg text-sm font-medium
                    bg-emerald-500 text-white
                    hover:bg-emerald-600
                    transition-all duration-200
                  "
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Navigation - Show only on small screens */}
          <div className="lg:hidden">
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}
