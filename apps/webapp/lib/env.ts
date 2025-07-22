/**
 * Environment variable configuration with type safety
 * Using @t3-oss/env-nextjs for Next.js-optimized environment validation
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

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

/**
 * Firebase client initialization
 * 
 * Initialize Firebase with validated environment variables and export services.
 * This approach keeps Firebase client-side initialization in the webapp where
 * Next.js can properly access NEXT_PUBLIC_* environment variables.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration using validated environment variables
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

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development
if (env.NODE_ENV === 'development') {
  try {
    // Only connect if not already connected (HMR safety)
    if (!(auth as any)._delegate._config?.emulator) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    }
    if (!(db as any)._delegate._databaseId.projectId.includes('(')) {
      connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
    if (!(functions as any)._delegate.customDomain) {
      connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    }
  } catch (error) {
    // Emulators may already be connected - this is expected in development
    console.debug('Firebase emulator connection info:', error);
  }
}