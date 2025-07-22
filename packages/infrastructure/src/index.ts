// Main infrastructure package entry point
// Client-side exports only (to prevent admin code in browser builds)

// Re-export all client-side Firebase repository implementations
export * from './client';

// Re-export authentication functions
export * from './authFunctions';

// Re-export reflection utilities
export * from './reflection';

// Re-export Firebase server-side configuration utilities
export * from './config/firebase';