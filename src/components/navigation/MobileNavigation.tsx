'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 text-slate-300 hover:text-emerald-400 transition-colors"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 w-screen bg-slate-900 border-b border-slate-700 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-slate-300 hover:text-emerald-400 transition-colors"
                  onClick={toggleMenu}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/portfolio"
                  className="block px-4 py-2 text-slate-300 hover:text-emerald-400 transition-colors"
                  onClick={toggleMenu}
                >
                  Portfolio
                </Link>
                <div className="px-4 py-2 text-sm text-slate-400">
                  {user?.email}
                </div>
                <button
                  onClick={() => {
                    logout();
                    toggleMenu();
                  }}
                  className="w-full text-left px-4 py-2 text-slate-300 hover:text-emerald-400 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-2 text-slate-300 hover:text-emerald-400 transition-colors"
                  onClick={toggleMenu}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 transition-colors rounded-lg text-center"
                  onClick={toggleMenu}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
