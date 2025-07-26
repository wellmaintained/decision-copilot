import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingErrorStateProps {
  isLoading: boolean;
  error: Error | null;
  onRetry?: () => void;
  loadingComponent?: React.ReactNode;
  errorTitle?: string;
  errorMessage?: string;
  children: React.ReactNode;
}

export function LoadingErrorState({
  isLoading,
  error,
  onRetry,
  loadingComponent,
  errorTitle = "Something went wrong",
  errorMessage,
  children,
}: LoadingErrorStateProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {loadingComponent || <DefaultLoadingSkeleton />}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title={errorTitle}
        message={errorMessage || error.message}
        onRetry={onRetry}
      />
    );
  }

  return <>{children}</>;
}

function DefaultLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

interface ErrorStateProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 text-destructive mb-2">
          <AlertCircle size={48} />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          {message}
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

// Loading spinner component for inline use
export function LoadingSpinner({ 
  size = 16, 
  className = "" 
}: { 
  size?: number; 
  className?: string; 
}) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin ${className}`} 
    />
  );
}

// Hook for consistent loading/error state management
export function useLoadingError() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const setErrorState = React.useCallback((error: Error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const reset = React.useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorState,
    clearError,
    reset,
  };
}