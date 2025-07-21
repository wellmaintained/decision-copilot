import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ServerEnvironmentLogger', () => {
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    // Mock console methods
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('logServerEnvironment', () => {
    it('should not log anything when NODE_ENV is not development', async () => {
      // Set NODE_ENV to production
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { logServerEnvironment } = await import('../../lib/debug/ServerEnvironmentLogger');
      
      logServerEnvironment();
      
      expect(consoleGroupSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      // Restore original NODE_ENV
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should log environment info when NODE_ENV is development', async () => {
      // Set NODE_ENV to development
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Set some test environment variables
      process.env.NEXT_PUBLIC_TEST = 'test-value';
      process.env.FIREBASE_API_KEY = 'test-firebase-key';

      const { logServerEnvironment } = await import('../../lib/debug/ServerEnvironmentLogger');
      
      logServerEnvironment();
      
      expect(consoleGroupSpy).toHaveBeenCalledWith('🖥️  Server-Side Environment Debug Info');
      expect(consoleLogSpy).toHaveBeenCalledWith('🌍 Node Environment:', 'development');
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('📁 Working Directory:'), expect.any(String));
      
      // Clean up
      delete process.env.NEXT_PUBLIC_TEST;
      delete process.env.FIREBASE_API_KEY;
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should mask sensitive environment variables', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Set a sensitive environment variable
      process.env.NEXT_PUBLIC_API_KEY = 'very-secret-api-key-value';

      const { logServerEnvironment } = await import('../../lib/debug/ServerEnvironmentLogger');
      
      logServerEnvironment();
      
      // Check that the sensitive value was masked
      const calls = consoleLogSpy.mock.calls;
      const keyCall = calls.find(call => call[0] === '   NEXT_PUBLIC_API_KEY:');
      expect(keyCall).toBeDefined();
      if (keyCall) {
        expect(keyCall[1]).toMatch(/^very\*\*\*\*alue$/);
      }
      
      // Clean up
      delete process.env.NEXT_PUBLIC_API_KEY;
      process.env.NODE_ENV = originalNodeEnv;
    });
  });

  describe('initializeServerEnvironmentLogging', () => {
    it('should call logServerEnvironment in development mode', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const { initializeServerEnvironmentLogging } = await import('../../lib/debug/ServerEnvironmentLogger');
      
      initializeServerEnvironmentLogging();
      
      expect(consoleGroupSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('🚀 Server-side environment logging initialized for development mode');
      
      process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not log anything in non-development mode', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const { initializeServerEnvironmentLogging } = await import('../../lib/debug/ServerEnvironmentLogger');
      
      initializeServerEnvironmentLogging();
      
      expect(consoleGroupSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      
      process.env.NODE_ENV = originalNodeEnv;
    });
  });
});