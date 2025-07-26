'use client';

import { Wifi, RefreshCw } from 'lucide-react';
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { env } from '@/lib/env';
import { ErrorBoundary } from './ErrorBoundary';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  onRetry?: () => void;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

function AsyncErrorFallback({ 
  onRetry, 
  fallbackTitle = "Unable to load data",
  fallbackMessage = "We're having trouble connecting to our servers. Please check your internet connection and try again."
}: {
  onRetry?: () => void;
  fallbackTitle?: string;
  fallbackMessage?: string;
}) {
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 text-muted-foreground mb-2">
          <Wifi size={48} />
        </div>
        <CardTitle className="text-base">{fallbackTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          {fallbackMessage}
        </p>
        {onRetry && (
          <Button onClick={onRetry} className="w-full" size="sm">
            <RefreshCw size={16} className="mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function AsyncErrorBoundary({ 
  children, 
  onRetry, 
  fallbackTitle, 
  fallbackMessage 
}: AsyncErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={
        <AsyncErrorFallback 
          onRetry={onRetry} 
          fallbackTitle={fallbackTitle}
          fallbackMessage={fallbackMessage}
        />
      }
      onError={(error, errorInfo) => {
        // Log async errors with additional context
        console.error('Async operation failed:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for manual error reporting within components
export function useErrorHandler() {
  const handleError = React.useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'component'}:`, error);
    
    // In production, send to error reporting service
    if (env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { tags: { context } });
    }
  }, []);

  return handleError;
}