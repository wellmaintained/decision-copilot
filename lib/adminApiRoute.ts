import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

type AdminRouteHandler = (
  req: NextRequest,
  context: { uid: string; params?: { [key: string]: string } }
) => Promise<NextResponse> | NextResponse;

/**
 * Higher-order function that wraps an API route handler with admin authentication
 * 
 * @param handler - The route handler to wrap
 * @returns A wrapped handler that checks for admin access
 * 
 * @example
 * ```typescript
 * // app/api/admin/some-endpoint/route.ts
 * export const POST = withAdminAuth(async (req, { uid, params }) => {
 *   // Your admin-only logic here
 *   return NextResponse.json({ success: true });
 * });
 * ```
 */
export function withAdminAuth(handler: AdminRouteHandler) {
  return async (req: NextRequest, context?: { params?: { [key: string]: string } }) => {
    try {
      // Get the session cookie
      const sessionCookie = req.cookies.get('session')?.value;

      if (!sessionCookie) {
        return NextResponse.json(
          { error: 'Unauthorized - No session' },
          { status: 401 }
        );
      }

      // Verify the session cookie and check admin claim
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      
      if (decodedClaims.admin !== true) {
        return NextResponse.json(
          { error: 'Forbidden - Not an admin' },
          { status: 403 }
        );
      }

      // Call the handler with the verified user ID and params
      return handler(req, { uid: decodedClaims.uid, params: context?.params });
    } catch (error) {
      console.error('Admin API route error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  };
} 