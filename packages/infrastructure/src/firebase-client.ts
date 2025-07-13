// Firebase client SDK initialization
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { getFirebaseClientConfig, getEmulatorConfig, shouldUseEmulators } from './config/firebase';

// Get validated Firebase configuration
const firebaseConfig = getFirebaseClientConfig();

// Only initialize if not already initialized (Next.js may run code more than once)
function createFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }
  return getApp();
}

const app = createFirebaseApp();

// Initialize Firebase services
const firestoreDatabaseId = firebaseConfig.firestoreDatabaseId!;
export const db = (firestoreDatabaseId === '(default)')
    ? getFirestore(app)
    : getFirestore(app, firestoreDatabaseId);

export const auth = getAuth(app);
export const functions = getFunctions(app);

// Connect to emulators if enabled
if (shouldUseEmulators()) {
  const emulatorConfig = getEmulatorConfig();
  console.log('Connecting to Firebase emulators in', process.env.NODE_ENV, 'environment');
  
  connectFirestoreEmulator(db, emulatorConfig.firestore.host, emulatorConfig.firestore.port);
  connectAuthEmulator(auth, emulatorConfig.auth.url);
  connectFunctionsEmulator(functions, emulatorConfig.functions.host, emulatorConfig.functions.port);
}