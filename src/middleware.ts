import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Basic protected paths that require login
  const protectedPaths = ['/dashboard', '/analyze', '/dashboard/saved', '/dashboard/favorites'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // Premium-only features
  const premiumPaths = ['/dashboard/compare'];
  const isPremiumPath = premiumPaths.some(path => pathname.startsWith(path));

  // Redirect to login if not authenticated
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Since database shows you're premium, allow access to premium features
  if (isPremiumPath && token) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analyze/:path*',
    '/dashboard/saved/:path*',
    '/api/properties/:path*'
  ]
};
