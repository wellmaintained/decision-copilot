/**
 * Environment variable debugging API route
 * Only available in development mode
 */

import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

/**
 * GET /api/debug/env
 * 
 * Returns environment variable information for debugging purposes
 * Only available in development mode
 */
export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Environment debugging not available in production' },
      { status: 404 }
    );
  }

  try {
    // Get categorized environment variables
    const serverVars: Record<string, string | undefined> = {
      PORT: env.PORT?.toString(),
      FIREBASE_AUTH_EMULATOR_HOST: env.FIREBASE_AUTH_EMULATOR_HOST,
      FIREBASE_FIRESTORE_EMULATOR_HOST: env.FIREBASE_FIRESTORE_EMULATOR_HOST,
      FIREBASE_STORAGE_EMULATOR_HOST: env.FIREBASE_STORAGE_EMULATOR_HOST,
      FIREBASE_FUNCTIONS_EMULATOR_HOST: env.FIREBASE_FUNCTIONS_EMULATOR_HOST,
      FIRESTORE_EMULATOR_HOST: env.FIRESTORE_EMULATOR_HOST,
    };

    const sharedVars: Record<string, string | undefined> = {
      NODE_ENV: env.NODE_ENV,
    };

    const clientVars: Record<string, string | undefined> = {
      NEXT_PUBLIC_FIREBASE_API_KEY: env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      NEXT_PUBLIC_BASE_URL: env.NEXT_PUBLIC_BASE_URL,
      NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID: env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID,
      NEXT_PUBLIC_AUTH_LOG_LEVEL: env.NEXT_PUBLIC_AUTH_LOG_LEVEL,
    };

    // Count variables
    const serverVarCount = Object.values(serverVars).filter(v => v !== undefined).length;
    const sharedVarCount = Object.values(sharedVars).filter(v => v !== undefined).length;
    const clientVarCount = Object.values(clientVars).filter(v => v !== undefined).length;

    const debugInfo = {
      timestamp: new Date().toISOString(),
      nodeEnv: env.NODE_ENV,
      categories: [
        {
          name: 'Server-Side Variables',
          icon: '🖥️',
          count: serverVarCount,
          variables: Object.fromEntries(
            Object.entries(serverVars).filter(([, value]) => value !== undefined)
          ),
        },
        {
          name: 'Shared Variables (Client & Server)',
          icon: '🔄',
          count: sharedVarCount,
          variables: Object.fromEntries(
            Object.entries(sharedVars).filter(([, value]) => value !== undefined)
          ),
        },
        {
          name: 'Client-Side Variables (NEXT_PUBLIC_*)',
          icon: '🌐',
          count: clientVarCount,
          variables: Object.fromEntries(
            Object.entries(clientVars).filter(([, value]) => value !== undefined)
          ),
        },
      ],
      totalCount: serverVarCount + sharedVarCount + clientVarCount,
      validationStatus: 'passed',
      message: 'Environment variables validated successfully with @t3-oss/env-nextjs',
    };

    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('Environment debugging error:', error);
    
    return NextResponse.json(
      {
        error: 'Environment validation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        validationStatus: 'failed',
      },
      { status: 500 }
    );
  }
}