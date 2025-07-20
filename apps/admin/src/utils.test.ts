import { describe, it, expect } from 'vitest';
import { greet, isValidEmail, formatTimestamp } from './utils.js';

describe('Admin CLI Utils', () => {
  describe('greet', () => {
    it('should return a greeting message', () => {
      expect(greet('World')).toBe('Hello, World!');
    });

    it('should handle empty string', () => {
      expect(greet('')).toBe('Hello, !');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('formatTimestamp', () => {
    it('should format date as ISO string', () => {
      const date = new Date('2025-01-20T12:00:00.000Z');
      expect(formatTimestamp(date)).toBe('2025-01-20T12:00:00.000Z');
    });
  });
});