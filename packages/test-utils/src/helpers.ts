// Test helper utilities

import { vi } from 'vitest';

/**
 * Creates a mock function that returns the provided value
 */
export const createMockFn = <T>(returnValue: T) => {
  return vi.fn().mockReturnValue(returnValue);
};

/**
 * Creates a mock async function that returns a resolved promise
 */
export const createMockAsyncFn = <T>(returnValue: T) => {
  return vi.fn().mockResolvedValue(returnValue);
};

/**
 * Creates a mock async function that returns a rejected promise
 */
export const createMockRejectedFn = (error: Error) => {
  return vi.fn().mockRejectedValue(error);
};

/**
 * Waits for a specified number of milliseconds
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Creates a test ID for consistent test data
 */
export const createTestId = (prefix: string, id: string | number): string => {
  return `${prefix}-${id}`;
}; 