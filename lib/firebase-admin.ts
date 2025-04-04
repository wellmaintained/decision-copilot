import { config } from 'dotenv'
import { resolve } from 'path'
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

// Simulate NextJS behaviour)
// .env will be loaded automatically by dotenv
config({ path: resolve(process.cwd(), '.env.development') })
config({ path: resolve(process.cwd(), '.env.production') })

if (!getApps().length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    // console.log('Raw JSON from env:', serviceAccountJson?.substring(0, 500) + '...')
    if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set')
    }

    const serviceAccount = JSON.parse(serviceAccountJson)
    initializeApp({
        credential: cert(serviceAccount)
    });
}

// Use the named database in production, default database otherwise
const isProduction = process.env.NODE_ENV === 'production';
const app = getApp();
export const adminDb = isProduction 
    ? getFirestore(app, 'decision-copilot-prod') 
    : getFirestore();