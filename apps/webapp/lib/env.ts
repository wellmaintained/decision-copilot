/**
 * Environment variable configuration with type safety
 * Using @t3-oss/env-nextjs for Next.js-optimized environment validation
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { z } from "zod";

/**
 * Firebase client initialization
 * 
 * Initialize Firebase with validated environment variables and export services.
 * This approach keeps Firebase client-side initialization in the webapp where
 * Next.js can properly access NEXT_PUBLIC_* environment variables.
 * 
 * ## Emulator Configuration
 * 
 * Firebase emulators can be configured via environment variables for flexibility:
 * 
 * - `FIREBASE_AUTH_EMULATOR_HOST`: Auth emulator URL (e.g., 'localhost:9099' or 'http://localhost:9099')
 * - `FIREBASE_FIRESTORE_EMULATOR_HOST`: Firestore emulator host:port (e.g., 'localhost:8080')
 * - `FIREBASE_FUNCTIONS_EMULATOR_HOST`: Functions emulator host:port (e.g., 'localhost:5001')
 * 
 * ## Default Values
 * 
 * If environment variables are not set, the following defaults are used:
 * - Auth: `http://127.0.0.1:9099`
 * - Firestore: `127.0.0.1:8080`
 * - Functions: `127.0.0.1:5001`
 * 
 * ## URL Formats
 * 
 * - Auth emulator accepts full URLs with protocol (automatically added if missing)
 * - Firestore and Functions emulators accept host:port format (parsed automatically)
 * - Both formats work with all emulators: `localhost:8080` or `http://localhost:8080`
 * 
 * @example Environment Configuration
 * ```bash
 * # .env.development
 * FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
 * FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
 * FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
 * ```
 */

export const env = createEnv({
  /**
   * Server-side environment variables
   * These are only available on the server and are not bundled for the client
   */
  server: {
    // Firebase Admin/Server-side variables
    FIREBASE_AUTH_EMULATOR_HOST: z.string().optional(),
    FIREBASE_FIRESTORE_EMULATOR_HOST: z.string().optional(),
    FIREBASE_STORAGE_EMULATOR_HOST: z.string().optional(),
    FIREBASE_FUNCTIONS_EMULATOR_HOST: z.string().optional(),
    FIRESTORE_EMULATOR_HOST: z.string().optional(),
    
    // Other server-side variables
    PORT: z.coerce.number().optional(),
  },

  /**
   * Client-side environment variables
   * These are exposed to the browser and must be prefixed with NEXT_PUBLIC_
   */
  client: {
    NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().min(1),
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_AUTH_LOG_LEVEL: z.enum(['off', 'error', 'warn', 'info', 'debug']).optional(),
  },

  /**
   * Shared environment variables
   * Available on both server and client sides
   */
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  },

  /**
   * Runtime environment mapping
   * This tells the library which environment variables to validate at runtime
   */
  runtimeEnv: {
    // Server-side
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    FIREBASE_FIRESTORE_EMULATOR_HOST: process.env.FIREBASE_FIRESTORE_EMULATOR_HOST,
    FIREBASE_STORAGE_EMULATOR_HOST: process.env.FIREBASE_STORAGE_EMULATOR_HOST,
    FIREBASE_FUNCTIONS_EMULATOR_HOST: process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST,
    FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST,
    PORT: process.env.PORT,
    
    // Client-side (NEXT_PUBLIC_*)
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_AUTH_LOG_LEVEL: process.env.NEXT_PUBLIC_AUTH_LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'info' : 'off'),
    
    // Shared variables
    NODE_ENV: process.env.NODE_ENV,
  },

  /**
   * Skip validation during build if not needed
   * This is useful for CI/CD environments where some variables might not be available
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Makes validation errors more verbose in development
   */
  onValidationError: (error) => {
    console.error(
      "❌ Invalid environment variables:",
      error,
    );
    throw new Error("Invalid environment variables");
  },

  /**
   * What object to use as the source of our environment variables.
   * This is useful for testing with custom environment variables.
   */
  emptyStringAsUndefined: true,
});

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);


/**
 * Track emulator connection state to prevent duplicate connections during HMR
 * This avoids accessing private Firebase internals and provides type safety
 */
const emulatorConnectionState = {
  auth: false,
  firestore: false,
  functions: false,
};

/**
 * Configuration for each emulator type
 */
interface EmulatorConfig {
  /** The service name for logging purposes */
  serviceName: string;
  /** The connection URL or host/port for the emulator */
  url: string;
  /** Additional connection parameters (e.g., port for Firestore and Functions) */
  host?: string;
  port?: number;
}

/**
 * Get emulator URL from environment variables with fallback defaults
 * 
 * This helper function provides a centralized way to resolve emulator URLs from
 * environment variables while maintaining backwards compatibility with hard-coded
 * defaults. It supports both full URLs and host:port formats.
 * 
 * @param emulatorType - The type of emulator ('auth', 'firestore', 'functions')
 * @param fallbackUrl - Default URL to use if environment variable is not set
 * @returns The resolved emulator URL, either from environment or fallback
 * 
 * @example
 * ```typescript
 * // Uses FIREBASE_AUTH_EMULATOR_HOST if set, otherwise 'http://127.0.0.1:9099'
 * const authUrl = getEmulatorUrl('auth', 'http://127.0.0.1:9099');
 * 
 * // Uses FIREBASE_FIRESTORE_EMULATOR_HOST if set, otherwise '127.0.0.1:8080'
 * const firestoreUrl = getEmulatorUrl('firestore', '127.0.0.1:8080');
 * ```
 */
function getEmulatorUrl(
  emulatorType: 'auth' | 'firestore' | 'functions',
  fallbackUrl: string
): string {
  let envVar: string | undefined;
  
  // Access emulator environment variables directly since they are development-only
  // and don't need the same validation as production config
  switch (emulatorType) {
    case 'auth':
      envVar = process.env.FIREBASE_AUTH_EMULATOR_HOST;
      break;
    case 'firestore':
      envVar = process.env.FIREBASE_FIRESTORE_EMULATOR_HOST;
      break;
    case 'functions':
      envVar = process.env.FIREBASE_FUNCTIONS_EMULATOR_HOST;
      break;
  }
  
  const resolvedUrl = envVar || fallbackUrl;
  
  // Add protocol for auth emulator if not present (auth emulator needs full URL)
  if (emulatorType === 'auth' && !resolvedUrl.startsWith('http')) {
    return `http://${resolvedUrl}`;
  }
  
  return resolvedUrl;
}

/**
 * Parse host and port from emulator URL for services that need separate parameters
 * 
 * Some Firebase emulator connection functions (like Firestore and Functions) require
 * separate host and port parameters instead of a full URL. This helper extracts
 * those components from the resolved emulator URL.
 * 
 * @param url - The emulator URL to parse (e.g., 'localhost:8080' or 'http://localhost:8080')
 * @returns Object containing host and port as separate values
 * 
 * @example
 * ```typescript
 * const { host, port } = parseEmulatorHostPort('127.0.0.1:8080');
 * // Returns: { host: '127.0.0.1', port: 8080 }
 * 
 * const { host, port } = parseEmulatorHostPort('http://localhost:9000');
 * // Returns: { host: 'localhost', port: 9000 }
 * ```
 */
function parseEmulatorHostPort(url: string): { host: string; port: number } {
  // Remove protocol if present
  const cleanUrl = url.replace(/^https?:\/\//, '');
  
  // Split host and port
  const [host, portStr] = cleanUrl.split(':');
  const port = parseInt(portStr, 10);
  
  if (isNaN(port)) {
    throw new Error(`Invalid emulator URL format: ${url}. Expected format: 'host:port' or 'http://host:port'`);
  }
  
  return { host, port };
}

/**
 * Centralized emulator connection helper
 * 
 * This function consolidates the duplicate emulator connection logic into a single,
 * reusable helper that handles connection state tracking, error handling, and logging
 * for all Firebase emulator types. It supports configuration via environment variables
 * with sensible fallbacks for development.
 * 
 * @param emulatorType - The type of emulator to connect to
 * @param connectFn - The Firebase connection function to execute
 * @param config - Configuration object containing connection details
 * @returns void
 * 
 * @example
 * ```typescript
 * const authUrl = getEmulatorUrl('auth', 'http://127.0.0.1:9099');
 * connectToEmulator('auth', 
 *   () => connectAuthEmulator(auth, authUrl),
 *   { serviceName: 'Auth', url: authUrl }
 * );
 * ```
 */
function connectToEmulator(
  emulatorType: keyof typeof emulatorConnectionState,
  connectFn: () => void,
  config: EmulatorConfig
): void {
  try {
    // Check if emulator is already connected
    if (!emulatorConnectionState[emulatorType]) {
      connectFn();
      emulatorConnectionState[emulatorType] = true;
      console.log(`✅ Connected to Firebase ${config.serviceName} emulator at ${config.url}`);
    }
  } catch (error) {
    // Emulator may already be connected - this is expected during HMR
    if (error instanceof Error && error.message.includes('already')) {
      emulatorConnectionState[emulatorType] = true;
    } else {
      console.error(`❌ Failed to connect to Firebase ${config.serviceName} emulator:`, error);
    }
  }
}

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
  // Connect to Auth emulator
  // Uses FIREBASE_AUTH_EMULATOR_HOST environment variable or defaults to 127.0.0.1:9099
  const authUrl = getEmulatorUrl('auth', 'http://127.0.0.1:9099');
  connectToEmulator('auth', 
    () => connectAuthEmulator(auth, authUrl),
    { serviceName: 'Auth', url: authUrl }
  );
  
  // Connect to Firestore emulator 
  // Uses FIREBASE_FIRESTORE_EMULATOR_HOST environment variable or defaults to 127.0.0.1:8080
  const firestoreUrl = getEmulatorUrl('firestore', '127.0.0.1:8080');
  const { host: firestoreHost, port: firestorePort } = parseEmulatorHostPort(firestoreUrl);
  connectToEmulator('firestore',
    () => connectFirestoreEmulator(db, firestoreHost, firestorePort),
    { serviceName: 'Firestore', url: firestoreUrl, host: firestoreHost, port: firestorePort }
  );
  
  // Connect to Functions emulator
  // Uses FIREBASE_FUNCTIONS_EMULATOR_HOST environment variable or defaults to 127.0.0.1:5001
  const functionsUrl = getEmulatorUrl('functions', '127.0.0.1:5001');
  const { host: functionsHost, port: functionsPort } = parseEmulatorHostPort(functionsUrl);
  connectToEmulator('functions',
    () => connectFunctionsEmulator(functions, functionsHost, functionsPort),
    { serviceName: 'Functions', url: functionsUrl, host: functionsHost, port: functionsPort }
  );
}