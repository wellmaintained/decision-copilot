/**
 * Firebase server-side configuration module
 * 
 * This module provides server-side Firebase configuration utilities.
 * Client-side Firebase initialization is handled by the webapp.
 * 
 * This module provides:
 * - Server-side admin SDK configuration
 * - Environment-specific admin settings
 * - Server-side emulator configuration
 */

export interface FirebaseAdminConfig {
  serviceAccountJson: string;
  databaseId?: string;
}

/**
 * Validates and returns Firebase admin configuration
 */
export function getFirebaseAdminConfig(): FirebaseAdminConfig {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
  }

  // Validate JSON format
  try {
    JSON.parse(serviceAccountJson);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON contains invalid JSON');
  }

  return {
    serviceAccountJson,
    databaseId: getFirebaseAdminDatabaseId(),
  };
}

/**
 * Returns the appropriate database ID for admin SDK
 */
export function getFirebaseAdminDatabaseId(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? 'decision-copilot-prod' : '(default)';
}

/**
 * Server-side utility to check if we should use emulators
 * Used by admin SDK and server-side functions
 */
export function shouldUseEmulators(): boolean {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  return isDevelopment || isTest;
}