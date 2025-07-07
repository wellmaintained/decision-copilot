/**
 * Test helper to create predictable dates for testing
 */
export class TestDateFactory {
  private static baseDate = new Date('2024-01-01T00:00:00Z')

  /**
   * Get a predictable date for testing
   */
  static create(daysOffset = 0, hoursOffset = 0): Date {
    const date = new Date(this.baseDate)
    date.setDate(date.getDate() + daysOffset)
    date.setHours(date.getHours() + hoursOffset)
    return date
  }

  /**
   * Get a date in the past relative to base date
   */
  static past(days = 1): Date {
    return this.create(-days)
  }

  /**
   * Get a date in the future relative to base date
   */
  static future(days = 1): Date {
    return this.create(days)
  }

  /**
   * Reset base date for testing
   */
  static setBaseDate(date: Date): void {
    this.baseDate = new Date(date)
  }
}

/**
 * Test helper to generate predictable IDs
 */
export class TestIdGenerator {
  private static counter = 0

  /**
   * Generate a unique test ID with optional prefix
   */
  static generate(prefix = 'test'): string {
    return `${prefix}-${++this.counter}`
  }

  /**
   * Generate multiple IDs with the same prefix
   */
  static generateMultiple(count: number, prefix = 'test'): string[] {
    return Array.from({ length: count }, () => this.generate(prefix))
  }

  /**
   * Reset counter for predictable testing
   */
  static reset(): void {
    this.counter = 0
  }
}

/**
 * Test helper for asserting error types and messages
 */
export function expectError<T extends Error>(
  fn: () => void | Promise<void>,
  expectedErrorClass: new (...args: unknown[]) => T,
  expectedMessage?: string | RegExp
): void {
  try {
    const result = fn()
    if (result instanceof Promise) {
      throw new Error('Use expectAsyncError for async functions')
    }
    throw new Error('Expected function to throw an error')
  } catch (error) {
    if (!(error instanceof expectedErrorClass)) {
      throw new Error(
        `Expected error of type ${expectedErrorClass.name}, got ${error?.constructor.name}`
      )
    }
    
    if (expectedMessage) {
      const message = error.message
      if (typeof expectedMessage === 'string') {
        if (message !== expectedMessage) {
          throw new Error(`Expected error message "${expectedMessage}", got "${message}"`)
        }
      } else if (!expectedMessage.test(message)) {
        throw new Error(`Expected error message to match ${expectedMessage}, got "${message}"`)
      }
    }
  }
}

/**
 * Test helper for asserting async error types and messages
 */
export async function expectAsyncError<T extends Error>(
  fn: () => Promise<void>,
  expectedErrorClass: new (...args: unknown[]) => T,
  expectedMessage?: string | RegExp
): Promise<void> {
  try {
    await fn()
    throw new Error('Expected async function to throw an error')
  } catch (error) {
    if (!(error instanceof expectedErrorClass)) {
      throw new Error(
        `Expected error of type ${expectedErrorClass.name}, got ${error?.constructor.name}`
      )
    }
    
    if (expectedMessage) {
      const message = error.message
      if (typeof expectedMessage === 'string') {
        if (message !== expectedMessage) {
          throw new Error(`Expected error message "${expectedMessage}", got "${message}"`)
        }
      } else if (!expectedMessage.test(message)) {
        throw new Error(`Expected error message to match ${expectedMessage}, got "${message}"`)
      }
    }
  }
}

/**
 * Test helper to wait for a specified amount of time
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Test helper to create a spy function that tracks calls
 */
export function createSpy<T extends (...args: unknown[]) => unknown>(
  implementation?: T
): T & { calls: unknown[][]; callCount: number; reset: () => void } {
  const calls: unknown[][] = []
  
  const spy = ((...args: unknown[]) => {
    calls.push(args)
    return implementation?.(...args)
  }) as T & { calls: unknown[][]; callCount: number; reset: () => void }
  
  Object.defineProperty(spy, 'calls', { get: () => calls })
  Object.defineProperty(spy, 'callCount', { get: () => calls.length })
  spy.reset = () => calls.length = 0
  
  return spy
}