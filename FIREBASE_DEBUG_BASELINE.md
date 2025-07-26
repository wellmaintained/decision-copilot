# Firebase OAuth Debug Baseline - Investigation Results

## Environment Details

**Date**: 2025-07-24 to 2025-07-26  
**Firebase SDK Version**: 11.10.0 (contains providerId bug in emulator)  
**Issue Resolution**: Firebase v11.10.0 works correctly, but requires workaround for complex Firebase initialization  
**Firebase CLI**: 14.10.1  
**Next.js**: Latest with App Router  
**Development Mode**: Using Firebase Emulators  

## Issue Summary

OAuth authentication fails in Firebase Auth emulator with error:
```
{ "authEmulator": { "error": "missing apiKey or providerId query parameters" } }
```

**Root Cause DEFINITIVELY IDENTIFIED**: After comprehensive Phase 3 deep internal analysis, the issue is **Webpack/bundling interference with Firebase SDK's internal URL generation** in monorepo environments.

**Key Finding**: Firebase SDK internals are PERFECT (`providerId: 'google.com'` correctly configured), but URL generation fails inside Firebase's `signInWithPopup` logic due to build environment interference.

**NOT an SDK Bug**: Firebase v11.10.0 works correctly - the issue is environmental webpack/bundling interference affecting internal URL construction.

## Current Implementation

### Provider Configuration
- **Google**: `new GoogleAuthProvider()` with scopes: profile, email
- **Microsoft**: `new OAuthProvider("microsoft.com")` with scopes: user.read, openid, profile, email
- Both configured with custom parameters and proper scope configuration

### Expected Debug Output Pattern

When running the debug-enabled code, we expect to see the following console output pattern:

#### 1. Firebase Initialization Debug
```
🔧 Firebase Initialization Debug
  Firebase App: [FirebaseApp object]
  Firebase Config: { apiKey: "fake-api-key", authDomain: "...", ... }
  Auth instance: [Auth object]
  Environment: development
```

#### 2. Emulator Connection Debug
```
🔌 Connecting to Auth Emulator
  Emulator Type: auth
  Emulator URL: http://127.0.0.1:9099
  Already Connected: false
  ✅ Connected to Firebase Auth emulator at http://127.0.0.1:9099
```

#### 3. Google OAuth Flow Debug
```
🚀 Starting Google OAuth Flow
  🔍 Auth Debug - Pre-Provider Creation
    Auth App Name: [DEFAULT]
    Auth Config: { apiKey: "fake-api-key", ... }
    Auth Current User: No user
    Emulator Config: { url: "http://127.0.0.1:9099", ... }
    Is Emulator Connected: true

  🔍 OAuth Debug - After Provider Creation
    Provider ID: google.com
    Provider Type: GoogleAuthProvider
    Provider Object: [GoogleAuthProvider]
    Provider Properties: [array of property names]

  🔍 OAuth Debug - After Scope Configuration
    Provider ID: google.com
    Provider Scopes: ["profile", "email"]
    [Additional provider details]

  🔍 OAuth Debug - After Custom Parameters
    Provider ID: google.com
    [Provider configuration after setCustomParameters]

  📞 About to call signInWithPopup
    Auth instance: [Auth object]
    Provider instance: [GoogleAuthProvider]
    Provider ID for URL generation: google.com
    Expected URL should contain providerId: google.com
```

#### 4. Network/Popup Debug (Expected Missing providerId)
```
🪟 Popup Debug - Auth Window Opening
  Popup URL: http://127.0.0.1:9099/emulator/auth/handler?apiKey=fake-api-key&appName=%5BDEFAULT%5D&authType=signInViaPopup&redirectUrl=http://localhost:3000/login&v=11.10.0&eventId=XXXXX
  Target: _blank
  Features: [popup features]
  Popup URL Parameters:
    apiKey: fake-api-key
    appName: [DEFAULT]
    authType: signInViaPopup
    redirectUrl: http://localhost:3000/login
    v: 11.10.0
    eventId: XXXXX
  Popup Has providerId: false  ← **THIS IS THE BUG**
  Popup providerId Value: null  ← **THIS IS THE BUG**
```

#### 5. Expected Error
```
❌ Google OAuth Error
  Error details: [Firebase Auth Error]
  Error message: "missing apiKey or providerId query parameters"
  Provider that failed: google.com
```

## Key Observations Pre-Upgrade

1. **Provider Objects Are Correct**: 
   - `provider.providerId` returns correct values ("google.com", "microsoft.com")
   - Provider instances are properly configured with scopes and parameters

2. **Firebase Configuration Is Correct**:
   - Auth instance properly initialized
   - Emulator connection established successfully
   - API key is present and correct ("fake-api-key")

3. **URL Generation Is Broken**:
   - Generated URLs contain `apiKey` parameter
   - Generated URLs are **missing** `providerId` parameter
   - This affects both `GoogleAuthProvider` and `OAuthProvider` classes

4. **Issue Is SDK-Internal**:
   - Local implementation is correct
   - Issue is in Firebase SDK's emulator URL generation logic
   - Bug confirmed in SDK version 11.10.0

## Test Plan for Post-Upgrade Verification

After upgrading to Firebase SDK ≥11.15.0, we should see:

1. **Same provider configuration debug output** (no changes expected)
2. **Same Firebase initialization debug output** (no changes expected) 
3. **Modified popup URL generation**:
   ```
   Popup URL: http://127.0.0.1:9099/emulator/auth/handler?apiKey=fake-api-key&appName=%5BDEFAULT%5D&authType=signInViaPopup&redirectUrl=http://localhost:3000/login&v=11.XX.0&eventId=XXXXX&providerId=google.com
   Popup Has providerId: true  ← **FIXED**
   Popup providerId Value: google.com  ← **FIXED**
   ```
4. **Successful OAuth authentication** instead of error
5. **Success debug output** instead of error debug output

## Manual Verification Steps

1. Start development server: `pnpm run dev:webapp`
2. Start Firebase emulators: `pnpm run dev:emulators:with-data`
3. Navigate to login page: http://localhost:3000/login
4. Open browser dev tools console
5. Click "Sign in with Google" button
6. Observe debug output in console
7. Note the presence/absence of `providerId` in popup URLs
8. Document authentication success/failure

## Files Modified for Debug Logging

1. **packages/infrastructure/src/authFunctions.ts**:
   - Added `logProviderDebugInfo()` function
   - Added `logAuthDebugInfo()` function
   - Added `interceptNetworkRequests()` function
   - Added comprehensive logging to `signInWithGoogle()` and `signInWithMicrosoft()`
   - Added `logFirebaseDebugSummary()` export

2. **apps/webapp/lib/env.ts**:
   - Enhanced `connectToEmulator()` function with detailed logging
   - Added Firebase initialization debug logging

3. **apps/webapp/app/login/page.tsx**:
   - Enhanced button click handlers with debug logging
   - Added error logging with detailed error analysis

## Expected SDK Upgrade Changes

- Firebase SDK: 11.10.0 → ≥11.15.0
- URLs should include `&providerId=provider_name` parameter
- OAuth authentication should succeed without manual workarounds
- Debug output should show successful authentication flows