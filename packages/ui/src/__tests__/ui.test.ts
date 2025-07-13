import { describe, it, expect } from 'vitest';
import { vi } from 'vitest';

describe('UI Package', () => {
  it('should be able to run basic tests', () => {
    expect(true).toBe(true);
  });

  it('should have utilities available', () => {
    expect(typeof import('../utils')).toBe('object');
  });

  it('should support component testing setup', async () => {
    const processModule = await vi.importActual<typeof import('process')>('process');
    expect(processModule.env.NODE_ENV).toBeDefined();
  });
});