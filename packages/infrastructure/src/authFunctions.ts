import {
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase-client";

// Single Responsibility: this function triggers a Google sign-in flow
export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

// Single Responsibility: this function triggers a Microsoft sign-in flow
export async function signInWithMicrosoft(): Promise<void> {
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

  const result = await signInWithPopup(auth, provider);
  console.log("MS Sign in success: user:", result.user);
}

// Single Responsibility: sign out the current user
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
