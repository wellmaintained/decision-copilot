'use client';

import { useState } from 'react';
import { useEnvDebug } from '@/hooks/useEnvDebug';

interface SimpleEnvDebuggerProps {
  showButton?: boolean;
  autoLog?: boolean;
}

/**
 * Simple component for debugging environment variables
 * Provides both automatic logging and manual trigger options
 */
export function SimpleEnvDebugger({ 
  showButton = true, 
  autoLog = false 
}: SimpleEnvDebuggerProps) {
  const [isEnabled, setIsEnabled] = useState(autoLog);
  const { debugInfo, logToConsole, isLogging, hasEnvironmentVars } = useEnvDebug(isEnabled);

  // Don't render anything in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleToggleDebugging = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    
    if (newEnabled) {
      // Small delay to ensure state is updated
      setTimeout(logToConsole, 100);
    }
  };

  if (!showButton && !autoLog) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'monospace',
    }}>
      {showButton && (
        <button
          onClick={handleToggleDebugging}
          disabled={isLogging}
          style={{
            padding: '8px 12px',
            backgroundColor: isEnabled ? '#22c55e' : '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLogging ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            opacity: isLogging ? 0.6 : 1,
          }}
        >
          {isLogging ? 'Logging...' : isEnabled ? 'Stop Debug' : 'Debug Env'}
        </button>
      )}
      
      {isEnabled && debugInfo && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          borderRadius: '4px',
          fontSize: '11px',
          maxWidth: '300px',
        }}>
          <div>Node: {debugInfo.nodeEnv}</div>
          <div>Vars: {Object.keys(debugInfo.clientVars).length}</div>
          <div>Client: {debugInfo.runtimeInfo.isClient ? '✅' : '❌'}</div>
          {!hasEnvironmentVars && (
            <div style={{ color: '#fbbf24' }}>⚠️ No NEXT_PUBLIC_ vars found</div>
          )}
        </div>
      )}
    </div>
  );
}