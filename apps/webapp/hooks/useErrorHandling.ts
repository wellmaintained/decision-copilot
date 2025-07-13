import { useCallback, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface ErrorState {
  error: Error | null;
  isError: boolean;
  message: string | null;
}

export interface UseErrorHandlingResult {
  errorState: ErrorState;
  handleError: (error: Error, userMessage?: string) => void;
  clearError: () => void;
  retryWithErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
}

/**
 * Custom hook for centralized error handling with user-friendly messaging
 */
export function useErrorHandling(): UseErrorHandlingResult {
  const { toast } = useToast();
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    message: null,
  });

  const handleError = useCallback((error: Error, userMessage?: string) => {
    const message = userMessage || getErrorMessage(error);
    
    setErrorState({
      error,
      isError: true,
      message,
    });

    // Show toast notification
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });

    // Log error for debugging
    console.error('Error handled:', {
      message: error.message,
      stack: error.stack,
      userMessage,
      timestamp: new Date().toISOString(),
    });
  }, [toast]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      message: null,
    });
  }, []);

  const retryWithErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      clearError();
      return await fn();
    } catch (error) {
      handleError(error as Error);
      return null;
    }
  }, [handleError, clearError]);

  return {
    errorState,
    handleError,
    clearError,
    retryWithErrorHandling,
  };
}

/**
 * Utility function to extract user-friendly error messages
 */
function getErrorMessage(error: Error): string {
  // Firebase-specific error handling
  if (error.message.includes('auth/')) {
    const authErrors: Record<string, string> = {
      'auth/user-not-found': 'User account not found. Please check your credentials.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password should be at least 6 characters.',
    };

    for (const [code, message] of Object.entries(authErrors)) {
      if (error.message.includes(code)) {
        return message;
      }
    }
  }

  // Firestore-specific error handling
  if (error.message.includes('firestore/') || error.message.includes('permission-denied')) {
    return 'You do not have permission to perform this action.';
  }

  if (error.message.includes('network') || error.message.includes('offline')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Validation errors
  if (error.message.includes('validation') || error.message.includes('required')) {
    return 'Please check the form data and ensure all required fields are filled.';
  }

  // Generic fallback
  if (error.message.length > 100) {
    return 'An unexpected error occurred. Please try again or contact support.';
  }

  return error.message || 'An unexpected error occurred.';
}

/**
 * Hook for async operations with built-in error handling
 */
export function useAsyncOperation<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, errorState, clearError } = useErrorHandling();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      const result = await operation();
      return result;
    } catch (error) {
      handleError(error as Error, errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    execute,
    isLoading,
    errorState,
    clearError,
  };
}