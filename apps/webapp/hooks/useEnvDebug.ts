'use client';

import { useEffect, useState } from 'react';

interface EnvDebugInfo {
  timestamp: string;
  nodeEnv: string;
  clientVars: Record<string, string>;
  runtimeInfo: {
    userAgent: string;
    currentUrl: string;
    isClient: boolean;
  };
}

/**
 * Simple hook for debugging environment variables on the client side
 * Only runs in development mode
 */
export function useEnvDebug(enabled = false) {
  const [debugInfo, setDebugInfo] = useState<EnvDebugInfo | null>(null);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') {
      return;
    }

    const collectEnvInfo = (): EnvDebugInfo => {
      // Collect NEXT_PUBLIC_ environment variables
      const clientVars: Record<string, string> = {};
      
      for (const key in process.env) {
        if (key.startsWith('NEXT_PUBLIC_')) {
          clientVars[key] = process.env[key] || '';
        }
      }

      return {
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV || 'unknown',
        clientVars,
        runtimeInfo: {
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
          isClient: typeof window !== 'undefined',
        },
      };
    };

    const info = collectEnvInfo();
    setDebugInfo(info);
  }, [enabled]);

  const logToConsole = () => {
    if (!debugInfo) return;

    setIsLogging(true);
    
    console.group('🔍 useEnvDebug Hook - Client Environment');
    console.log('Timestamp:', debugInfo.timestamp);
    console.log('Node Environment:', debugInfo.nodeEnv);
    console.log('Is Client Side:', debugInfo.runtimeInfo.isClient);
    console.log('Environment Variables Count:', Object.keys(debugInfo.clientVars).length);
    
    console.group('📋 Client Environment Variables:');
    Object.entries(debugInfo.clientVars).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();
    
    console.log('Runtime Info:', debugInfo.runtimeInfo);
    console.groupEnd();
    
    setTimeout(() => setIsLogging(false), 500);
  };

  return {
    debugInfo,
    logToConsole,
    isLogging,
    hasEnvironmentVars: debugInfo ? Object.keys(debugInfo.clientVars).length > 0 : false,
  };
}