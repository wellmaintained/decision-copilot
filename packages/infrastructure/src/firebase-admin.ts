import { config } from 'dotenv'
import { resolve } from 'path'
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getFirebaseAdminConfig, getFirebaseAdminDatabaseId } from './config/firebase'

// Load environment files for non-Next.js environments
config({ path: resolve(process.cwd(), '.env.development') })
config({ path: resolve(process.cwd(), '.env.production') })

// Initialize Firebase Admin SDK
if (!getApps().length) {
    const adminConfig = getFirebaseAdminConfig();
    const serviceAccount = JSON.parse(adminConfig.serviceAccountJson);
    
    initializeApp({
        credential: cert(serviceAccount)
    });
}

// Initialize Firestore with appropriate database
const app = getApp();
const databaseId = getFirebaseAdminDatabaseId();
export const adminDb = databaseId === '(default)' 
    ? getFirestore() 
    : getFirestore(app, databaseId);