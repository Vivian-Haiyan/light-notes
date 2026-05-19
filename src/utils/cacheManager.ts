interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache: Map<string, CacheItem> = new Map();
  private defaultTTL = 10 * 60;

  set(key: string, data: any, ttl?: number): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };
    this.cache.set(key, item);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    const elapsed = (Date.now() - item.timestamp) / 1000;
    if (elapsed >= item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(key: string): void {
    this.cache.delete(key);
  }

  clearAll(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const cacheManager = new CacheManager();
