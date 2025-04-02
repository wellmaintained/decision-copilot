import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, getAdminUsers } from '@/lib/firebase-admin';

/**
 * API route handler to check if a user is an admin and set the admin claim
 */
export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { idToken } = body;
    
    if (!idToken) {
      return NextResponse.json(
        { error: 'No ID token provided' },
        { status: 401 }
      );
    }

    // Verify the token and get the user
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const user = await adminAuth.getUser(decodedToken.uid);
    
    // Get admin users and check if the user is an admin
    const adminUsers = getAdminUsers();
    const isAdmin = user.email ? adminUsers.includes(user.email) : false;
    console.log('adminUsers', adminUsers);
    console.log('user.email', user.email);
    console.log('isAdmin', isAdmin);
    
    // Set the admin custom claim
    await adminAuth.setCustomUserClaims(user.uid, { admin: isAdmin });
    
    // Return the result
    return NextResponse.json({ success: true, isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check admin status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 