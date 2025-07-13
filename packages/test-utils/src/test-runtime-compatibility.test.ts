import { describe, it, expect } from 'vitest';

/**
 * Test to verify that all packages can be dynamically required
 * This ensures CommonJS compatibility across the monorepo
 */
describe('Runtime Compatibility', () => {
  it('should be able to require domain package', () => {
    // This test verifies that the domain package can be dynamically imported
    // which is important for runtime compatibility in Node.js environments
    expect(() => {
      require('@decision-copilot/domain');
    }).not.toThrow();
  });

  it('should be able to require infrastructure package', () => {
    expect(() => {
      require('@decision-copilot/infrastructure');
    }).not.toThrow();
  });

  it('should be able to require UI package', () => {
    expect(() => {
      require('@decision-copilot/ui');
    }).not.toThrow();
  });

  it('should be able to require test-utils package', () => {
    expect(() => {
      require('@decision-copilot/test-utils');
    }).not.toThrow();
  });

  it('should be able to require config packages', () => {
    expect(() => {
      require('@decision-copilot/config-eslint');
    }).not.toThrow();

    expect(() => {
      require('@decision-copilot/config-typescript');
    }).not.toThrow();
  });
}); 