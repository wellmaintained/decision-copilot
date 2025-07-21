/**
 * Next.js instrumentation file
 * This runs when the Next.js server starts up
 * 
 * IMPORTANT: This file works in both Node.js and Edge runtime
 * Use process.env.NEXT_RUNTIME to target specific runtime
 */

export async function register() {
  // Only run instrumentation in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Instrumentation: Starting in', process.env.NEXT_RUNTIME || 'nodejs', 'runtime');
    
    // Runtime-specific guard - only run environment logging in Node.js runtime
    if (process.env.NEXT_RUNTIME === 'nodejs' || !process.env.NEXT_RUNTIME) {
      // Dynamic import to avoid bundling in production
      const { initializeServerEnvironmentLogging } = await import('./lib/debug/ServerEnvironmentLogger');
      
      // Initialize server environment logging
      initializeServerEnvironmentLogging();
    } else if (process.env.NEXT_RUNTIME === 'edge') {
      // Edge runtime has limited environment variable access
      console.log('🔗 Edge Runtime detected - limited environment debugging available');
      console.log('📊 NODE_ENV:', process.env.NODE_ENV);
      console.log('⚙️ For full environment debugging, check /api/debug/environment');
    }
  }
}