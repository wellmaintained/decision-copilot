// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyCdxfhEXgjcvIFF5GUUnFwnAscUj4HNsMY",
  authDomain: "decision-copilot.firebaseapp.com",
  projectId: "decision-copilot",
  storageBucket: "decision-copilot.firebasestorage.app",
  messagingSenderId: "698337109435",
  appId: "1:698337109435:web:1c6a069dcf70a3469bd09e",
  measurementId: "G-FVPGZL8NDE",
};

// Only initialize if not already initialized (Next.js may run code more than once)
function createFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = createFirebaseApp();

const firestoreDatabaseId = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID || '(default)';
export const db = (firestoreDatabaseId === '(default)')
    ? getFirestore(app)
    : getFirestore(app, firestoreDatabaseId);

export const auth = getAuth(app);
export const functions = getFunctions(app);

// Connect to emulators in test and development
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  console.log('connecting to emulators because NODE_ENV:', process.env.NODE_ENV);
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}