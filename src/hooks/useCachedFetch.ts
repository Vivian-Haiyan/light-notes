import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager } from '../utils/cacheManager';

interface UseCachedFetchOptions {
  refresh?: boolean;
  ttl?: number;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refreshing: boolean;
  refresh: () => void;
}

const pendingRequests = new Map<string, Promise<any>>();

export function useCachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options: UseCachedFetchOptions = {}
): UseCachedFetchResult<T> {
  const ttl = options.ttl ?? 5 * 60;
  
  const [data, setData] = useState<T | null>(() => {
    const cached = cacheManager.get(cacheKey);
    return cached ?? null;
  });
  
  const [loading, setLoading] = useState<boolean>(() => {
    return !cacheManager.has(cacheKey);
  });
  
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const fetchFnRef = useRef(fetchFn);
  const mountedRef = useRef(true);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    if (!mountedRef.current) return;

    try {
      const cachedData = cacheManager.get(cacheKey);
      
      if (cachedData && !forceRefresh) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      const existingRequest = pendingRequests.get(cacheKey);
      if (existingRequest) {
        try {
          const result = await existingRequest;
          if (mountedRef.current) {
            setData(result);
            setLoading(false);
          }
        } catch (err) {
          if (mountedRef.current) {
            setError(err instanceof Error ? err : new Error('Failed to fetch'));
            setLoading(false);
          }
        }
        return;
      }

      if (forceRefresh && cachedData) {
        setRefreshing(true);
      } else if (!cachedData) {
        setLoading(true);
      }
      setError(null);

      const request = fetchFnRef.current();
      pendingRequests.set(cacheKey, request);

      const freshData = await request;
      cacheManager.set(cacheKey, freshData, ttl);
      
      if (mountedRef.current) {
        setData(freshData);
        setLoading(false);
        setRefreshing(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch'));
        // 即使出错也停止 loading，避免一直显示加载状态
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          setData(cachedData);
        }
        setLoading(false);
        setRefreshing(false);
      }
    } finally {
      pendingRequests.delete(cacheKey);
    }
  }, [cacheKey, ttl]);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadData(false);
    }
  }, [loadData]);

  const refresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  return { data, loading, error, refreshing, refresh };
}
