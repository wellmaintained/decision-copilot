/**
 * Centralized Firebase configuration module
 * 
 * This module provides:
 * - Environment variable validation
 * - Type-safe configuration objects
 * - Environment-specific settings
 * - Emulator configuration logic
 */

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

export interface FirebaseAdminConfig {
  serviceAccountJson: string;
  databaseId?: string;
}

export interface EmulatorConfig {
  enabled: boolean;
  firestore: {
    host: string;
    port: number;
  };
  auth: {
    url: string;
  };
  functions: {
    host: string;
    port: number;
  };
}

/**
 * Validates and returns Firebase client configuration
 */
export function getFirebaseClientConfig(): FirebaseClientConfig {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ] as const;

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}. Please check your .env.local file.`);
  }

  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    firestoreDatabaseId: process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
  };
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
 * Returns emulator configuration based on environment
 */
export function getEmulatorConfig(): EmulatorConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isTest = process.env.NODE_ENV === 'test';
  const enabled = isDevelopment || isTest;

  return {
    enabled,
    firestore: {
      host: '127.0.0.1',
      port: 8080,
    },
    auth: {
      url: 'http://127.0.0.1:9099',
    },
    functions: {
      host: '127.0.0.1',
      port: 5001,
    },
  };
}

/**
 * Utility to check if we should use emulators
 */
export function shouldUseEmulators(): boolean {
  return getEmulatorConfig().enabled;
}