# Simple Environment Variable Debugging Approaches

## Overview

This document provides simple, lightweight approaches for debugging environment variables in Next.js applications without complex custom logging systems. All approaches are designed to work reliably in development environments and provide immediate feedback.

## Quick Summary Table

| Approach | Use Case | Complexity | Client/Server | Best For |
|----------|----------|------------|---------------|----------|
| Console.log in Pages | Quick server-side checks | Low | Server | Development startup debugging |
| API Route Inspection | Structured server env viewing | Low | Server | Comprehensive server env analysis |
| Next.js Middleware | Request-based debugging | Medium | Server | Route-specific env checking |
| React Hook | Client-side env debugging | Medium | Client | Interactive client debugging |
| Browser Console Helpers | Manual debugging | Low | Client | Ad-hoc testing and debugging |
| Floating Debug Component | Visual env display | Medium | Client | Real-time env monitoring |

---

## 1. Console.log-based Approaches

### 1.1 Simple Page-Level Console Logging

**Best for:** Quick server-side environment checks during page load

```tsx
// In any page component or server component
export default function Page() {
  // Server-side console logging (appears in terminal)
  console.log('🔍 Server Environment Check:', {
    nodeEnv: process.env.NODE_ENV,
    firebaseProject: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    timestamp: new Date().toISOString(),
  });

  return <div>Your page content</div>;
}
```

**Pros:**
- Immediate feedback in terminal
- Zero configuration required
- Works in all Next.js page types
- Simple copy-paste implementation

**Cons:**
- Only shows during page load
- Limited to server-side variables
- Logs appear in terminal, not browser

---

## 2. API Route Approaches

### 2.1 Comprehensive Environment API Route

**Best for:** Structured server-side environment inspection

**Implementation:**
```typescript
// app/api/debug/env/route.ts
import { NextResponse } from 'next/server';

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
```

**Usage:**
1. Start your Next.js dev server: `pnpm run dev`
2. Visit: `http://localhost:3000/api/debug/env`
3. View JSON response with categorized environment variables

**Pros:**
- Comprehensive server environment overview
- Categorized and organized display
- Sensitive value masking built-in
- Works from browser or curl
- Includes server console logging

**Cons:**
- Requires creating API route file
- Only shows server-side environment
- JSON format may be hard to read

---

## 3. Next.js Middleware Debugging

### 3.1 Request-Based Environment Logging

**Best for:** Debugging environment variables for specific requests or routes

**Implementation:**
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only run debug logging in development mode
  if (process.env.NODE_ENV === 'development') {
    // Simple environment debugging in middleware
    const debugHeaders = {
      'x-debug-node-env': process.env.NODE_ENV || 'unknown',
      'x-debug-timestamp': new Date().toISOString(),
    };

    // Add debug headers to response (visible in Network tab)
    const response = NextResponse.next();
    Object.entries(debugHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Log environment info for specific paths
    if (request.nextUrl.pathname.startsWith('/api/debug')) {
      console.log('🔧 Middleware - Environment Debug Request:', {
        path: request.nextUrl.pathname,
        method: request.method,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
        hasFirebaseConfig: !!(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
      });
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on API routes and specific debug paths
  matcher: ['/api/debug/:path*', '/((?!_next/static|_next/image|favicon.ico).*)']
};
```

**Usage:**
1. Access any route that matches the middleware config
2. Check server console for log output
3. Inspect Network tab headers for debug information

**Pros:**
- Runs on every matching request
- Can add debug headers visible in browser
- Useful for route-specific debugging
- Low performance impact

**Cons:**
- Requires middleware configuration
- Limited to server-side variables
- More complex setup than simple console.log

---

## 4. React Components/Hooks for Client-Side Debugging

### 4.1 Simple Environment Debug Hook

**Best for:** Interactive client-side environment variable debugging

**Implementation:**
```typescript
// hooks/useEnvDebug.ts
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
```

### 4.2 Floating Debug Component

**Implementation:**
```tsx
// components/debug/SimpleEnvDebugger.tsx
'use client';

import { useState } from 'react';
import { useEnvDebug } from '@/hooks/useEnvDebug';

interface SimpleEnvDebuggerProps {
  showButton?: boolean;
  autoLog?: boolean;
}

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
```

**Usage:**
```tsx
// Add to your app layout or any page
import { SimpleEnvDebugger } from '@/components/debug/SimpleEnvDebugger';

export default function Layout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SimpleEnvDebugger />
      </body>
    </html>
  );
}
```

**Pros:**
- Visual interface in browser
- Real-time environment monitoring
- Interactive debugging control
- Automatically hidden in production
- Shows client-side environment variables

**Cons:**
- Requires React component integration
- Only shows NEXT_PUBLIC_ variables
- Client-side only

---

## 5. Browser Dev Tools Console Approaches

### 5.1 Console Helper Functions

**Best for:** Manual debugging and ad-hoc testing

**Implementation:**
```typescript
// lib/debug/consoleHelpers.ts
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

export function initConsoleHelpers() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Add debug functions to window for easy console access
    (window as any).debugEnv = debugEnv;
    (window as any).debugRuntime = debugRuntime;
    (window as any).debugServerEnv = debugServerEnv;
    
    console.log('🔧 Debug helpers initialized! Try:');
    console.log('  • debugEnv() - Client environment variables');
    console.log('  • debugRuntime() - Runtime information');
    console.log('  • debugServerEnv() - Server environment via API');
  }
}
```

**Setup:**
```tsx
// Add to your app layout or _app.tsx
import { initConsoleHelpers } from '@/lib/debug/consoleHelpers';

export default function Layout({ children }) {
  useEffect(() => {
    initConsoleHelpers();
  }, []);

  return <>{children}</>;
}
```

**Usage:**
1. Open browser dev tools console
2. Type any of these commands:
   - `debugEnv()` - Show client environment variables
   - `debugRuntime()` - Show runtime info
   - `debugServerEnv()` - Fetch and show server environment

**Pros:**
- Manual control over debugging
- No UI clutter
- Comprehensive information display
- Works from browser console
- Both client and server environment access

**Cons:**
- Requires manual console interaction
- Must remember function names
- Requires initial setup

---

## 6. Minimal Configuration Debugging Methods

### 6.1 Single Line Environment Check

**Best for:** Quick environment validation

```tsx
// Add this single line anywhere in your code
{process.env.NODE_ENV === 'development' && console.log('ENV_CHECK:', { NODE_ENV: process.env.NODE_ENV, FIREBASE_PROJECT: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID })}
```

### 6.2 Simple Environment Display Component

```tsx
// One-liner debug component
const EnvStatus = () => process.env.NODE_ENV === 'development' ? 
  <div style={{position:'fixed',top:0,right:0,background:'red',color:'white',padding:'4px',fontSize:'10px'}}>
    {process.env.NODE_ENV} | {Object.keys(process.env).filter(k=>k.startsWith('NEXT_PUBLIC_')).length} vars
  </div> : null;
```

---

## 7. Testing All Approaches

### 7.1 Step-by-Step Testing Guide

1. **Setup Environment Variables:**
   ```bash
   # Ensure you have environment variables set
   echo "NEXT_PUBLIC_TEST_VAR=test_value" >> .env.development
   ```

2. **Test Console.log Approach:**
   - Add console.log to any page component
   - Start dev server: `pnpm run dev`
   - Check terminal output

3. **Test API Route:**
   - Create the API route file
   - Visit `http://localhost:3000/api/debug/env`
   - Check JSON response

4. **Test React Hook:**
   - Add the hook and component to your app
   - Look for floating debug button
   - Click and check browser console

5. **Test Console Helpers:**
   - Add console helpers to your app
   - Open browser dev tools
   - Run `debugEnv()` in console

### 7.2 Troubleshooting Common Issues

**Problem: No environment variables showing**
- Solution: Ensure variables start with `NEXT_PUBLIC_`
- Check `.env.development` file exists and has correct format

**Problem: API route returns 403**
- Solution: Verify `NODE_ENV=development`
- Check API route is in correct directory structure

**Problem: Console functions not available**
- Solution: Ensure `initConsoleHelpers()` is called
- Check browser console for initialization messages

**Problem: Component not rendering**
- Solution: Verify component is added to layout
- Check `NODE_ENV` is set to 'development'

---

## 8. Recommendations

### 8.1 Best Practices

1. **For Quick Debugging:** Use console.log in page components
2. **For Comprehensive Analysis:** Use API route approach
3. **For Interactive Debugging:** Use React hook with floating component
4. **For Manual Testing:** Use browser console helpers

### 8.2 When to Use Each Approach

- **Console.log:** When you need immediate feedback during development
- **API Route:** When you need to inspect server environment comprehensively
- **Middleware:** When you need request-specific environment debugging
- **React Hook:** When you want interactive client-side debugging
- **Console Helpers:** When you need manual control and don't want UI elements

### 8.3 Security Considerations

- All approaches automatically disabled in production
- Sensitive values are masked in API responses
- No environment variables are exposed beyond what Next.js already makes available
- Debug components and routes only work in development mode

---

## 9. Implementation Priority

1. **Start with:** Simple console.log approach for immediate needs
2. **Add:** API route for comprehensive server environment inspection
3. **Consider:** React hook for interactive debugging if needed
4. **Optional:** Middleware and console helpers for advanced scenarios

All approaches are lightweight, require minimal configuration, and provide immediate feedback for environment variable debugging in Next.js applications.