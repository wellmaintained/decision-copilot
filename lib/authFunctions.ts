import { GoogleAuthProvider, OAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from './firebase';

// Single Responsibility: this function triggers a Google sign-in flow
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

// Single Responsibility: this function triggers a Microsoft sign-in flow
export async function signInWithMicrosoft(): Promise<void> {
  const provider = new OAuthProvider('microsoft.com');
  // Configure Microsoft provider - you can add scopes as needed
  provider.setCustomParameters({
    // You can add specific parameters here if needed
    // For example, prompt: 'consent' to force consent screen
  });
  await signInWithPopup(auth, provider);
}

// Single Responsibility: sign out the current user
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}