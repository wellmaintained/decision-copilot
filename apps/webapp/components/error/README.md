# Error Handling System

This directory contains a comprehensive error handling system for the Decision Copilot webapp.

## Components

### ErrorBoundary
React Error Boundary component that catches JavaScript errors anywhere in the component tree.

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/error';

<ErrorBoundary showError={process.env.NODE_ENV === 'development'}>
  <YourComponent />
</ErrorBoundary>
```

**Features:**
- Catches and displays user-friendly error messages
- Shows detailed error information in development
- Provides retry and navigation options
- Can be customized with custom fallback UI

### AsyncErrorBoundary
Specialized error boundary for async operations and data fetching.

**Usage:**
```tsx
import { AsyncErrorBoundary } from '@/components/error';

<AsyncErrorBoundary onRetry={refetch}>
  <DataComponent />
</AsyncErrorBoundary>
```

### ErrorProvider
Context provider for global error reporting and handling.

**Usage:**
```tsx
import { ErrorProvider, useErrorReporting } from '@/components/error';

// In your app root
<ErrorProvider>
  <App />
</ErrorProvider>

// In components
function MyComponent() {
  const { reportError, reportUserError } = useErrorReporting();
  
  const handleError = (error: Error) => {
    reportError(error, 'MyComponent');
  };
}
```

### LoadingErrorState
Component for handling loading and error states in a unified way.

**Usage:**
```tsx
import { LoadingErrorState } from '@/components/error';

<LoadingErrorState
  isLoading={loading}
  error={error}
  onRetry={retry}
>
  <YourContent />
</LoadingErrorState>
```

## Hooks

### useErrorHandling
Hook for centralized error handling with user-friendly messaging.

```tsx
import { useErrorHandling } from '@/components/error';

function MyComponent() {
  const { errorState, handleError, clearError, retryWithErrorHandling } = useErrorHandling();
  
  const fetchData = async () => {
    await retryWithErrorHandling(async () => {
      const data = await api.getData();
      return data;
    });
  };
}
```

### useAsyncOperation
Hook for async operations with built-in error handling.

```tsx
import { useAsyncOperation } from '@/components/error';

function MyComponent() {
  const { execute, isLoading, errorState } = useAsyncOperation();
  
  const handleSubmit = async (data) => {
    const result = await execute(
      () => api.submitData(data),
      'Failed to submit data'
    );
  };
}
```

### useLoadingError
Hook for managing loading and error states.

```tsx
import { useLoadingError } from '@/components/error';

function MyComponent() {
  const { isLoading, error, startLoading, stopLoading, setError, reset } = useLoadingError();
}
```

## Error Handling Patterns

### 1. Component-Level Error Boundaries
Wrap components that might throw errors:

```tsx
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

### 2. Async Operation Error Handling
Use hooks for async operations:

```tsx
const { execute, isLoading, errorState } = useAsyncOperation();

const handleAction = async () => {
  await execute(
    () => performAsyncOperation(),
    'Operation failed'
  );
};
```

### 3. Global Error Reporting
Report errors for monitoring:

```tsx
const { reportError } = useErrorReporting();

try {
  await riskyOperation();
} catch (error) {
  reportError(error, 'ComponentName');
}
```

### 4. User-Friendly Error Messages
The system automatically converts technical errors to user-friendly messages:

- Network errors → "Connection error. Please check your internet connection."
- Permission errors → "You do not have permission to perform this action."
- Validation errors → "Please check your input and try again."

## Best Practices

1. **Always use error boundaries** around components that might throw
2. **Use async operation hooks** for data fetching and mutations
3. **Report errors** to the global error handler for monitoring
4. **Provide retry mechanisms** for recoverable errors
5. **Show loading states** during async operations
6. **Clear errors** when users take corrective action

## Integration with External Services

The error handling system is designed to integrate with error monitoring services like Sentry:

```tsx
// In ErrorProvider.tsx
if (process.env.NODE_ENV === 'production') {
  Sentry.captureException(error, {
    tags: { context },
    extra: { timestamp: new Date().toISOString() }
  });
}
```

## Testing Error Handling

To test error boundaries and error handling:

1. Use React's error simulation in tests
2. Mock API failures to test error states
3. Test error recovery and retry mechanisms
4. Verify user-friendly error messages are displayed