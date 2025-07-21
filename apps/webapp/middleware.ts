import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only run debug logging in development mode
  if (process.env.NODE_ENV === 'development') {
    // Simple environment debugging in middleware
    const debugHeaders = {
      'x-debug-node-env': process.env.NODE_ENV || 'unknown',
      'x-debug-timestamp': new Date().toISOString(),
    };

    // Add debug headers to response (visible in Network tab)
    const response = NextResponse.next();
    Object.entries(debugHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Log environment info for specific paths
    if (request.nextUrl.pathname.startsWith('/api/debug')) {
      console.log('🔧 Middleware - Environment Debug Request:', {
        path: request.nextUrl.pathname,
        method: request.method,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        hasFirebaseConfig: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on API routes and specific debug paths
  matcher: ['/api/debug/:path*', '/((?!_next/static|_next/image|favicon.ico).*)']
};