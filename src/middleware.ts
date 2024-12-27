import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/analyze', '/dashboard/saved', '/dashboard/favorites'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
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
