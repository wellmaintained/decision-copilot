/**
 * Next.js instrumentation file
 * This runs when the Next.js server starts up
 */

export async function register() {
  // Only run instrumentation in development mode
  if (process.env.NODE_ENV === 'development') {
    // Dynamic import to avoid bundling in production
    const { initializeServerEnvironmentLogging } = await import('./lib/debug/ServerEnvironmentLogger');
    
    // Initialize server environment logging
    initializeServerEnvironmentLogging();
  }
}