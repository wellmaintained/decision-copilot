/**
 * Simple console helpers for environment debugging
 * These can be used directly in browser console or added to global window object
 */

/**
 * Debug environment variables from browser console
 * Usage: window.debugEnv() or debugEnv() if attached to window
 */
export function debugEnv() {
  console.group('🔍 Environment Variables Debug');
  
  // Client-side environment variables
  const clientVars: Record<string, string> = {};
  for (const key in process.env) {
    if (key.startsWith('NEXT_PUBLIC_')) {
      clientVars[key] = process.env[key] || '';
    }
  }
  
  console.log('📊 Environment Variable Count:', Object.keys(clientVars).length);
  console.log('🌍 Node Environment:', process.env.NODE_ENV);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  if (Object.keys(clientVars).length > 0) {
    console.table(clientVars);
  } else {
    console.warn('⚠️  No NEXT_PUBLIC_ environment variables found');
  }
  
  console.groupEnd();
}

/**
 * Debug runtime information from browser console
 */
export function debugRuntime() {
  console.group('🔧 Runtime Debug Info');
  
  const runtimeInfo = {
    userAgent: navigator.userAgent,
    currentUrl: window.location.href,
    timestamp: new Date().toISOString(),
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    online: navigator.onLine,
    language: navigator.language,
    platform: navigator.platform,
  };
  
  console.table(runtimeInfo);
  console.groupEnd();
}

/**
 * Debug server environment via API call
 */
export async function debugServerEnv() {
  try {
    console.group('🖥️  Server Environment Debug');
    console.log('Fetching server environment info...');
    
    const response = await fetch('/api/debug/env');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('📊 Server Environment Summary:', data.totals);
    console.log('🕐 Server Timestamp:', data.timestamp);
    
    // Log each category
    Object.entries(data.categories).forEach(([category, vars]) => {
      if (Object.keys(vars as Record<string, string>).length > 0) {
        console.group(`${category} (${Object.keys(vars as Record<string, string>).length} vars)`);
        console.table(vars);
        console.groupEnd();
      }
    });
    
    console.groupEnd();
  } catch (error) {
    console.error('❌ Failed to fetch server environment:', error);
  }
}

/**
 * Initialize debug helpers in browser console
 * Call this to add debugging functions to window object
 */
export function initConsoleHelpers() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Add debug functions to window for easy console access
    const windowObj = window as unknown as Record<string, unknown>;
    windowObj.debugEnv = debugEnv;
    windowObj.debugRuntime = debugRuntime;
    windowObj.debugServerEnv = debugServerEnv;
    
    console.log('🔧 Debug helpers initialized! Try:');
    console.log('  • debugEnv() - Client environment variables');
    console.log('  • debugRuntime() - Runtime information');
    console.log('  • debugServerEnv() - Server environment via API');
  }
}