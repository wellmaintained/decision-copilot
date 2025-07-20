/**
 * Simple utility functions for the admin CLI
 */

export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function formatTimestamp(date: Date): string {
  return date.toISOString();
}