import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { Auth } from "firebase/auth";

export async function signInWithGoogle(auth: Auth): Promise<void> {
  const provider = new GoogleAuthProvider();
  
  provider.addScope('profile');
  provider.addScope('email');
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  await signInWithPopup(auth, provider);
}

export async function signInWithMicrosoft(auth: Auth): Promise<void> {
  const provider = new OAuthProvider("microsoft.com");
  // Configure Microsoft provider with necessary scopes
  provider.addScope("user.read");
  provider.addScope("openid");
  provider.addScope("profile");
  provider.addScope("email");

  // Set tenant to 'common' to allow both work/school and personal Microsoft accounts
  // Add additional parameters to ensure we get the photo URL
  provider.setCustomParameters({
    tenant: "common",
    prompt: "select_account",
  });

  await signInWithPopup(auth, provider);
}

export async function signOutUser(auth: Auth): Promise<void> {
  await signOut(auth);
}
