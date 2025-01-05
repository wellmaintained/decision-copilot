import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Single Responsibility: this function triggers a Google sign-in flow
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

// Single Responsibility: sign out the current user
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}