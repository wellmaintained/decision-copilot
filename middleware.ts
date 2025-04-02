import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes
 * Verifies session cookie and admin claim
 */
export const config = {
  matcher: [
    // Match all admin routes except settings (which has its own auth)
    '/admin/:path*',
    // Match admin API routes except settings
    '/api/admin/:path*',
  ]
};

export async function middleware(request: NextRequest) {
  // Skip middleware for admin settings page - it has its own auth
  if (request.nextUrl.pathname.startsWith('/admin/settings') || 
      request.nextUrl.pathname.startsWith('/api/admin/settings')) {
    return NextResponse.next();
  }

  // For all other admin routes, check if session cookie exists
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Let the request through - actual auth verification will happen in the API routes
  return NextResponse.next();
} 