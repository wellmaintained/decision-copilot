import { NextRequest } from 'next/server';

/**
 * Environment debugging API route
 * Provides on-demand server-side environment variable inspection
 * Only available in development mode
 */

interface EnvironmentDebugInfo {
  timestamp: string;
  runtime: string;
  nodeEnv: string;
  workingDirectory: string;
  publicVariables: Record<string, string>;
  serverVariables: Record<string, string>;
  totalCount: number;
}

function maskSensitiveValue(key: string, value: string): string {
  const sensitiveKeys = ['key', 'secret', 'token', 'password', 'auth'];
  const isSensitive = sensitiveKeys.some(sensitiveKey => 
    key.toLowerCase().includes(sensitiveKey)
  );
  
  if (!isSensitive || !value || value.length < 8) {
    return value;
  }
  
  return value.substring(0, 4) + '****' + value.substring(value.length - 4);
}

function categorizeEnvironmentVariables(): EnvironmentDebugInfo {
  const env = process.env;
  const publicVariables: Record<string, string> = {};
  const serverVariables: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(env)) {
    if (!value) continue;
    
    const maskedValue = maskSensitiveValue(key, value);
    
    if (key.startsWith('NEXT_PUBLIC_')) {
      publicVariables[key] = maskedValue;
    } else if (['NODE_ENV', 'PORT', 'HOSTNAME', 'PWD'].includes(key) || 
               key.includes('FIREBASE') || key.includes('FIRE_')) {
      serverVariables[key] = maskedValue;
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    runtime: process.env.NEXT_RUNTIME || 'nodejs',
    nodeEnv: process.env.NODE_ENV || 'unknown',
    workingDirectory: process.cwd(),
    publicVariables,
    serverVariables,
    totalCount: Object.keys(publicVariables).length + Object.keys(serverVariables).length
  };
}

export async function GET(request: NextRequest) {
  // Development-only guard
  if (process.env.NODE_ENV !== 'development') {
    return new Response('Debug endpoint not available in production', { 
      status: 404,
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }

  try {
    const debugInfo = categorizeEnvironmentVariables();
    
    return Response.json(debugInfo, {
      headers: {
        'Content-Type': 'application/json',
        'X-Debug-Runtime': debugInfo.runtime,
        'X-Debug-Timestamp': debugInfo.timestamp,
      }
    });
  } catch (error) {
    console.error('Error in environment debug endpoint:', error);
    
    return Response.json(
      { 
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
        runtime: process.env.NEXT_RUNTIME || 'nodejs'
      }, 
      { status: 500 }
    );
  }
}