'use client';

import { useEffect } from 'react';

interface EnvironmentLoggerProps {
  enabled?: boolean;
}

export function EnvironmentLogger({ enabled = true }: EnvironmentLoggerProps) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Get all environment variables accessible on the client side
    const clientEnvVars: Record<string, string> = {};
    
    // In Next.js, only environment variables prefixed with NEXT_PUBLIC_ are available on the client
    // We'll also check process.env for any other variables that might be exposed
    for (const key in process.env) {
      if (key.startsWith('NEXT_PUBLIC_') || process.env[key] !== undefined) {
        clientEnvVars[key] = process.env[key] || '';
      }
    }

    // Also log some runtime information that might be useful for debugging
    const debugInfo = {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
      nodeEnv: process.env.NODE_ENV,
      environmentVariables: clientEnvVars,
    };

    console.group('🔍 Client-side Environment Debug Info');
    console.log('Timestamp:', debugInfo.timestamp);
    console.log('Node Environment:', debugInfo.nodeEnv);
    console.log('User Agent:', debugInfo.userAgent);
    console.log('Current URL:', debugInfo.currentUrl);
    console.log('Environment Variables Count:', Object.keys(clientEnvVars).length);
    
    console.group('📋 Environment Variables:');
    Object.entries(clientEnvVars).forEach(([key, value]) => {
      // Mask sensitive values for security
      const maskedValue = key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('token')
        ? value.substring(0, 4) + '****' + value.substring(value.length - 4)
        : value;
      console.log(`${key}:`, maskedValue);
    });
    console.groupEnd();
    
    console.log('Full debug object:', debugInfo);
    console.groupEnd();
    
  }, [enabled]);

  // This component doesn't render anything visible
  return null;
}