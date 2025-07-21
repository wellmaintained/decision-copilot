import { NextResponse } from 'next/server';

/**
 * Simple API route for debugging environment variables on the server side
 * GET /api/debug/env
 */
export async function GET() {
  // Only allow this in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Environment debugging is only available in development mode' },
      { status: 403 }
    );
  }

  // Categorize environment variables
  const envCategories = {
    nextPublic: {} as Record<string, string>,
    firebase: {} as Record<string, string>,
    development: {} as Record<string, string>,
    system: {} as Record<string, string>,
  };

  // Mask sensitive values
  const maskValue = (key: string, value: string): string => {
    const sensitiveKeys = ['key', 'secret', 'token', 'password'];
    const isSensitive = sensitiveKeys.some(k => key.toLowerCase().includes(k));
    
    if (isSensitive && value.length > 8) {
      return `${value.substring(0, 4)}****${value.substring(value.length - 4)}`;
    }
    return value;
  };

  // Categorize all environment variables
  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;

    const maskedValue = maskValue(key, value);

    if (key.startsWith('NEXT_PUBLIC_')) {
      envCategories.nextPublic[key] = maskedValue;
    } else if (key.includes('FIREBASE') || key.includes('FIRE_')) {
      envCategories.firebase[key] = maskedValue;
    } else if (['NODE_ENV', 'PORT', 'HOSTNAME'].includes(key)) {
      envCategories.development[key] = maskedValue;
    } else if (['PWD', 'PATH', 'HOME', 'USER'].includes(key)) {
      envCategories.system[key] = maskedValue;
    }
  }

  const response = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    categories: envCategories,
    totals: {
      nextPublic: Object.keys(envCategories.nextPublic).length,
      firebase: Object.keys(envCategories.firebase).length,
      development: Object.keys(envCategories.development).length,
      system: Object.keys(envCategories.system).length,
    },
  };

  // Also log to server console for immediate debugging
  console.log('\n🔍 Environment Debug API called:', new Date().toISOString());
  console.log('📊 Environment variable counts:', response.totals);

  return NextResponse.json(response);
}