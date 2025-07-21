'use client';

import { useEffect } from 'react';

interface EnvironmentLoggerProps {
  enabled?: boolean;
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

export function EnvironmentLogger({ enabled = true }: EnvironmentLoggerProps) {
  useEffect(() => {
    // Multiple guards for safety
    if (!enabled || process.env.NODE_ENV !== 'development') {
      return;
    }

    // ONLY get NEXT_PUBLIC_ prefixed environment variables - these are safe for client
    const publicEnvVars: Record<string, string> = {};
    
    // Only iterate through environment variables that are explicitly public
    for (const key in process.env) {
      if (key.startsWith('NEXT_PUBLIC_') && process.env[key] !== undefined) {
        publicEnvVars[key] = process.env[key] || '';
      }
    }

    // Runtime information safe for client-side
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
      nodeEnv: process.env.NODE_ENV,
      publicEnvironmentVariables: publicEnvVars,
    };

    console.group('🖥️ Client-side Environment Debug Info (Public Variables Only)');
    console.log('⏰ Timestamp:', debugInfo.timestamp);
    console.log('🌍 Node Environment:', debugInfo.nodeEnv);
    console.log('🌐 User Agent:', debugInfo.userAgent.substring(0, 50) + '...');
    console.log('📍 Current URL:', debugInfo.currentUrl);
    console.log('📊 Public Environment Variables Count:', Object.keys(publicEnvVars).length);
    
    if (Object.keys(publicEnvVars).length > 0) {
      console.group('📋 NEXT_PUBLIC_ Variables:');
      Object.entries(publicEnvVars).forEach(([key, value]) => {
        const maskedValue = maskSensitiveValue(key, value);
        console.log(`   ${key}:`, maskedValue);
      });
      console.groupEnd();
    } else {
      console.log('ℹ️ No NEXT_PUBLIC_ environment variables found');
    }
    
    // Note about server-side variables
    console.log('💡 For server-side environment variables, use: /api/debug/environment');
    console.groupEnd();
    
  }, [enabled]);

  // This component doesn't render anything visible
  return null;
}