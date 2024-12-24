'use client';
import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  if (isAuthPage) return null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/80 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Brand */}
          <div className="flex-shrink-0">
            <Link 
              href="/" 
              className="text-xl font-bold bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Deal Sage AI
            </Link>
          </div>

          {/* Right side - Auth Actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={logout}
                className="
                  px-4 py-2 rounded-full text-sm font-medium
                  text-gray-600 hover:text-black
                  transition-all duration-200
                  border border-gray-200 hover:border-gray-300
                  hover:shadow-sm
                "
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  className="
                    px-4 py-2 rounded-full text-sm font-medium
                    text-gray-600 hover:text-black
                    transition-all duration-200
                  "
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="
                    px-4 py-2 rounded-full text-sm font-medium
                    bg-black text-white
                    hover:bg-gray-800
                    transition-all duration-200
                  "
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Navigation />
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
