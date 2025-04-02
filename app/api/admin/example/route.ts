import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/adminApiRoute';

/**
 * Example protected admin API endpoint
 */
export const GET = withAdminAuth(async (req: NextRequest, { uid }) => {
  return NextResponse.json({
    message: 'This is a protected admin endpoint',
    uid,
    timestamp: new Date().toISOString()
  });
});

export const POST = withAdminAuth(async (req: NextRequest, { uid }) => {
  const body = await req.json();
  
  return NextResponse.json({
    message: 'Admin data received',
    uid,
    receivedData: body,
    timestamp: new Date().toISOString()
  });
}); 