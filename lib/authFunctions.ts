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
  // Configure Microsoft provider with necessary scopes
  provider.addScope('user.read');
  provider.addScope('openid');
  provider.addScope('profile');
  provider.addScope('email');
  // Set tenant to 'common' to allow both work/school and personal Microsoft accounts
  provider.setCustomParameters({
    tenant: 'common',
    prompt: 'select_account'
  });
  await signInWithPopup(auth, provider);
}

// Single Responsibility: sign out the current user
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}