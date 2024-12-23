'use client';
import { usePathname } from 'next/navigation';
import { Geist, Geist_Mono } from "next/font/google";
import Link from 'next/link';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isAuthenticated = pathname.startsWith('/dashboard') || pathname.startsWith('/analyze');

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`
          relative px-4 py-2 rounded-full transition-all duration-200 ease-in-out
          ${isActive 
            ? 'bg-black text-white dark:bg-white dark:text-black' 
            : 'text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white'
          }
          font-medium text-sm
          before:content-[''] before:absolute before:inset-0 before:rounded-full 
          before:transition-all before:duration-200
          ${isActive 
            ? 'before:bg-black dark:before:bg-white before:opacity-10' 
            : 'before:opacity-0 hover:before:opacity-5'
          }
        `}
      >
        {children}
      </Link>
    );
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {!isAuthPage && (
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

                {/* Center - Main Navigation (only show if authenticated) */}
                {isAuthenticated && (
                  <nav className="hidden sm:flex items-center space-x-1 bg-gray-50 p-1 rounded-full">
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/dashboard/saved">Saved Properties</NavLink>
                    <NavLink href="/analyze">Analyze a Deal</NavLink>
                  </nav>
                )}

                {/* Right side - Auth Actions */}
                <div className="flex items-center space-x-4">
                  {isAuthenticated ? (
                    <Link
                      href="/login"
                      className="
                        px-4 py-2 rounded-full text-sm font-medium
                        text-gray-600 hover:text-black
                        transition-all duration-200
                        border border-gray-200 hover:border-gray-300
                        hover:shadow-sm
                      "
                    >
                      Logout
                    </Link>
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

            {/* Mobile Navigation (only show if authenticated) */}
            {isAuthenticated && (
              <div className="sm:hidden bg-gray-50 p-2">
                <nav className="flex flex-col space-y-1">
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/dashboard/saved">Saved Properties</NavLink>
                  <NavLink href="/analyze">Analyze a Deal</NavLink>
                </nav>
              </div>
            )}
          </header>
        )}

        {children}
      </body>
    </html>
  );
}
