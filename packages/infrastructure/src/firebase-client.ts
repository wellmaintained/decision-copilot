/**
 * Firebase client utilities for infrastructure package
 * 
 * This file provides utilities that work with Firebase services but does NOT
 * handle client-side Firebase initialization (that's handled by the webapp).
 * 
 * The infrastructure package should only contain:
 * - Repository classes that accept initialized Firebase services
 * - Server-side admin SDK utilities (with process.env access)
 */

// Re-export Firebase types that repositories need
export type { Firestore } from 'firebase/firestore';
export type { Auth } from 'firebase/auth';
export type { Functions } from 'firebase/functions';