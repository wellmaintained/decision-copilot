import { config } from 'dotenv'
import { resolve } from 'path'
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Simulate NextJS behaviour)
// .env will be loaded automatically by dotenv
config({ path: resolve(process.cwd(), '.env.development') })
config({ path: resolve(process.cwd(), '.env.production') })

if (!getApps().length) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        // Use emulator in development/test
        process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
        process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
        initializeApp({ projectId: 'decision-copilot' });
        console.log('Admin SDK initialized with emulators');
    } else {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
        if (!serviceAccountJson) {
            throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set')
        }

        const serviceAccount = JSON.parse(serviceAccountJson)
        initializeApp({
            credential: cert(serviceAccount)
        });
        console.log('Admin SDK initialized with service account');
    }
}

// Use the named database in production, default database otherwise
const isProduction = process.env.NODE_ENV === 'production';
const app = getApp();
export const adminDb = isProduction 
    ? getFirestore(app, 'decision-copilot-prod') 
    : getFirestore();

// Export Auth for user management
export const adminAuth = getAuth(app);

/**
 * Get the list of admin users from environment variables
 */
export function getAdminUsers(): string[] {
    return (process.env.ADMIN_USERS || '').split(',').map(email => email.trim());
}