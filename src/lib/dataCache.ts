const CACHE_TTL_MS = 5 * 60_000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export function readCache<T>(entry: CacheEntry<T> | null): T | undefined {
  if (!entry || entry.expiresAt <= Date.now()) {
    return undefined;
  }

  return entry.value;
}

export function createCacheEntry<T>(value: T): CacheEntry<T> {
  return {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  };
}
