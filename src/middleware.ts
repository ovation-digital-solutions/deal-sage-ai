import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add the paths that require authentication
const protectedPaths = ['/dashboard', '/analyze', '/dashboard/saved'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Check if the path is protected and user is not authenticated
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !token) {
    // Redirect to login page with a return URL
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analyze/:path*', '/dashboard/saved/:path*']
};
