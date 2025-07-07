import { useState, useEffect, useCallback } from 'react';
import { queryCache } from '@/lib/cache/QueryCache';

interface UseOptimizedFirestoreOptions {
  cacheKey: string;
  cacheTTL?: number;
  enableCache?: boolean;
}

/**
 * Hook for optimized Firestore queries with caching
 */
export function useOptimizedFirestore<T>(
  queryFn: () => Promise<T>,
  options: UseOptimizedFirestoreOptions,
  dependencies: any[] = []
) {
  const { cacheKey, cacheTTL, enableCache = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first if enabled
      if (enableCache) {
        const cachedData = queryCache.get<T>(cacheKey);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data
      const result = await queryFn();
      setData(result);

      // Cache the result if enabled
      if (enableCache) {
        queryCache.set(cacheKey, result, cacheTTL);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [queryFn, cacheKey, cacheTTL, enableCache]);

  // Invalidate cache and refetch
  const invalidateAndRefetch = useCallback(() => {
    if (enableCache) {
      queryCache.invalidate(cacheKey);
    }
    fetchData();
  }, [cacheKey, enableCache, fetchData]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    invalidateAndRefetch,
  };
}