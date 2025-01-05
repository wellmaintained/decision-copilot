// lib/firebase.ts
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

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

export const db = getFirestore(app);
export const auth = getAuth(app);