// src/utils/cache.ts

/**
 * Client-Side Cache Manager
 * Implements multiple caching strategies for API responses
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  storage?: 'memory' | 'localStorage' | 'sessionStorage';
  key?: string;
}

class CacheManager {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private storageAvailable: Map<string, boolean> = new Map();

  constructor() {
    // Check storage availability on initialization
    this.checkStorageAvailability();
  }

  /**
   * Check if a storage type is available
   */
  private checkStorageAvailability(): void {
    // Check localStorage
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      this.storageAvailable.set('localStorage', true);
    } catch (e) {
      this.storageAvailable.set('localStorage', false);
      console.warn('localStorage is not available');
    }

    // Check sessionStorage
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      this.storageAvailable.set('sessionStorage', true);
    } catch (e) {
      this.storageAvailable.set('sessionStorage', false);
      console.warn('sessionStorage is not available');
    }
  }

  /**
   * Check if a storage type is available
   */
  private isStorageAvailable(storage: 'localStorage' | 'sessionStorage'): boolean {
    return this.storageAvailable.get(storage) || false;
  }

  /**
   * Generate cache key from parameters
   */
  private generateKey(namespace: string, params: any): string {
    const paramString = JSON.stringify(params);
    return `${namespace}:${paramString}`;
  }

  /**
   * Get data from cache
   */
  get<T>(
    namespace: string,
    params: any = {},
    options: CacheOptions = {}
  ): T | null {
    const key = options.key || this.generateKey(namespace, params);
    const storage = options.storage || 'memory';

    let entry: CacheEntry<T> | null = null;

    // Retrieve from appropriate storage
    switch (storage) {
      case 'memory':
        entry = this.memoryCache.get(key) || null;
        break;

      case 'localStorage':
        if (this.isStorageAvailable('localStorage')) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) entry = JSON.parse(stored);
          } catch (e) {
            console.error('Error reading from localStorage:', e);
          }
        }
        break;

      case 'sessionStorage':
        if (this.isStorageAvailable('sessionStorage')) {
          try {
            const stored = sessionStorage.getItem(key);
            if (stored) entry = JSON.parse(stored);
          } catch (e) {
            console.error('Error reading from sessionStorage:', e);
          }
        }
        break;
    }

    // Check if entry exists and is not expired
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data;
    }

    // Remove expired entry
    if (entry) {
      this.delete(namespace, params, options);
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(
    namespace: string,
    params: any = {},
    data: T,
    options: CacheOptions = {}
  ): void {
    const key = options.key || this.generateKey(namespace, params);
    const storage = options.storage || 'memory';
    const ttl = options.ttl || this.DEFAULT_TTL;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    // Store in appropriate storage
    switch (storage) {
      case 'memory':
        this.memoryCache.set(key, entry);
        break;

      case 'localStorage':
        if (this.isStorageAvailable('localStorage')) {
          try {
            localStorage.setItem(key, JSON.stringify(entry));
          } catch (e) {
            console.error('Error writing to localStorage:', e);
            // Fallback to memory cache if localStorage fails
            this.memoryCache.set(key, entry);
          }
        } else {
          // Fallback to memory cache if localStorage unavailable
          this.memoryCache.set(key, entry);
        }
        break;

      case 'sessionStorage':
        if (this.isStorageAvailable('sessionStorage')) {
          try {
            sessionStorage.setItem(key, JSON.stringify(entry));
          } catch (e) {
            console.error('Error writing to sessionStorage:', e);
            // Fallback to memory cache if sessionStorage fails
            this.memoryCache.set(key, entry);
          }
        } else {
          // Fallback to memory cache if sessionStorage unavailable
          this.memoryCache.set(key, entry);
        }
        break;
    }
  }

  /**
   * Delete data from cache
   */
  delete(namespace: string, params: any = {}, options: CacheOptions = {}): void {
    const key = options.key || this.generateKey(namespace, params);
    const storage = options.storage || 'memory';

    switch (storage) {
      case 'memory':
        this.memoryCache.delete(key);
        break;

      case 'localStorage':
        if (this.isStorageAvailable('localStorage')) {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            console.error('Error removing from localStorage:', e);
          }
        }
        break;

      case 'sessionStorage':
        if (this.isStorageAvailable('sessionStorage')) {
          try {
            sessionStorage.removeItem(key);
          } catch (e) {
            console.error('Error removing from sessionStorage:', e);
          }
        }
        break;
    }
  }

  /**
   * Clear all cache for a namespace
   */
  clearNamespace(namespace: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    switch (storage) {
      case 'memory':
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(`${namespace}:`)) {
            this.memoryCache.delete(key);
          }
        }
        break;

      case 'localStorage':
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`${namespace}:`)) {
            localStorage.removeItem(key);
          }
        }
        break;

      case 'sessionStorage':
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(`${namespace}:`)) {
            sessionStorage.removeItem(key);
          }
        }
        break;
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.memoryCache.clear();
    localStorage.clear();
    sessionStorage.clear();
  }

  /**
   * Get or fetch with cache
   * Implements stale-while-revalidate pattern
   */
  async getOrFetch<T>(
    namespace: string,
    params: any,
    fetcher: () => Promise<T>,
    options: CacheOptions & { staleWhileRevalidate?: boolean } = {}
  ): Promise<T> {
    const cached = this.get<T>(namespace, params, options);

    // Return cached data if available
    if (cached) {
      // If stale-while-revalidate, fetch in background
      if (options.staleWhileRevalidate) {
        fetcher().then((data) => {
          this.set(namespace, params, data, options);
        });
      }
      return cached;
    }

    // Fetch fresh data
    const data = await fetcher();
    this.set(namespace, params, data, options);
    return data;
  }

  /**
   * Invalidate cache based on pattern
   */
  invalidatePattern(pattern: string, storage: 'memory' | 'localStorage' | 'sessionStorage' = 'memory'): void {
    const regex = new RegExp(pattern);

    switch (storage) {
      case 'memory':
        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            this.memoryCache.delete(key);
          }
        }
        break;

      case 'localStorage':
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const key = localStorage.key(i);
          if (key && regex.test(key)) {
            localStorage.removeItem(key);
          }
        }
        break;

      case 'sessionStorage':
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const key = sessionStorage.key(i);
          if (key && regex.test(key)) {
            sessionStorage.removeItem(key);
          }
        }
        break;
    }
  }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * React Hook for cached API calls
 */
export function useCachedFetch<T>(
  namespace: string,
  params: any,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await cache.getOrFetch(namespace, params, fetcher, options);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [JSON.stringify(params)]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

// Add React import for the hook
import React from 'react';
