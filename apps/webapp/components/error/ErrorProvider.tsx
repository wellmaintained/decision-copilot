'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ErrorContextType {
  reportError: (error: Error, context?: string) => void;
  reportUserError: (message: string, context?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const { toast } = useToast();

  const reportError = useCallback((error: Error, context?: string) => {
    // Log to console for debugging
    console.error(`Error ${context ? `in ${context}` : ''}:`, {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example with Sentry:
      // Sentry.captureException(error, {
      //   tags: { context },
      //   extra: {
      //     timestamp: new Date().toISOString(),
      //     url: window.location.href,
      //   }
      // });
    }

    // Show user-friendly message
    toast({
      title: "Error",
      description: getUserFriendlyMessage(error),
      variant: "destructive",
    });
  }, [toast]);

  const reportUserError = useCallback((message: string, context?: string) => {
    console.warn(`User error ${context ? `in ${context}` : ''}: ${message}`);
    
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  return (
    <ErrorContext.Provider value={{ reportError, reportUserError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export function useErrorReporting() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useErrorReporting must be used within an ErrorProvider');
  }
  return context;
}

function getUserFriendlyMessage(error: Error): string {
  const message = error.message.toLowerCase();

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Connection error. Please check your internet connection and try again.';
  }

  // Permission errors
  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'You do not have permission to perform this action.';
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid')) {
    return 'Please check your input and try again.';
  }

  // Firebase auth errors
  if (message.includes('auth/')) {
    return 'Authentication error. Please log in again.';
  }

  // Generic fallback
  return 'Something went wrong. Please try again.';
}

// Global error handler for unhandled promise rejections and errors
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default behavior (logging to console)
      event.preventDefault();
      
      // Report to error service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(event.reason);
      }
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });

      // Report to error service
      if (process.env.NODE_ENV === 'production') {
        // Example: Sentry.captureException(event.error || new Error(event.message));
      }
    });
  }
}