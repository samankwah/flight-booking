// server/middleware/cache.js
/**
 * Server-Side Caching Middleware
 * Implements in-memory caching for API responses
 */

class CacheStore {
  constructor() {
    this.store = new Map();
    this.expirations = new Map();
  }

  /**
   * Generate cache key from request
   */
  generateKey(req) {
    const { method, originalUrl, query, body } = req;
    const params = method === 'GET' ? query : body;
    return `${method}:${originalUrl}:${JSON.stringify(params)}`;
  }

  /**
   * Get from cache
   */
  get(key) {
    const expiration = this.expirations.get(key);

    // Check if entry has expired
    if (expiration && expiration < Date.now()) {
      this.delete(key);
      return null;
    }

    return this.store.get(key) || null;
  }

  /**
   * Set in cache
   */
  set(key, value, ttl = 300000) {
    // Default TTL: 5 minutes
    this.store.set(key, value);
    this.expirations.set(key, Date.now() + ttl);

    // Schedule cleanup
    setTimeout(() => {
      this.delete(key);
    }, ttl);
  }

  /**
   * Delete from cache
   */
  delete(key) {
    this.store.delete(key);
    this.expirations.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
    this.expirations.clear();
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getStats() {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Create singleton cache store
const cacheStore = new CacheStore();

/**
 * Cache middleware factory
 */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300000, // 5 minutes default
    keyGenerator = null,
    skip = null,
  } = options;

  return (req, res, next) => {
    // Skip caching if condition is met
    if (skip && skip(req)) {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator ? keyGenerator(req) : cacheStore.generateKey(req);

    // Try to get from cache
    const cachedResponse = cacheStore.get(cacheKey);

    if (cachedResponse) {
      console.log(`✅ Cache HIT: ${cacheKey}`);
      return res.status(cachedResponse.status).json(cachedResponse.data);
    }

    console.log(`❌ Cache MISS: ${cacheKey}`);

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache response
    res.json = (data) => {
      // Cache the response
      cacheStore.set(
        cacheKey,
        {
          status: res.statusCode,
          data,
        },
        ttl
      );

      // Send response
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware to cache flight search results
 */
export const cacheFlightSearch = cacheMiddleware({
  ttl: 60000, // 1 minute (flight prices change frequently)
  skip: (req) => req.method !== 'POST', // Only cache POST requests
});

/**
 * Middleware to cache airport search results
 */
export const cacheAirportSearch = cacheMiddleware({
  ttl: 3600000, // 1 hour (airport data doesn't change often)
  skip: (req) => req.method !== 'GET',
});

/**
 * Middleware to cache static data
 */
export const cacheStaticData = cacheMiddleware({
  ttl: 86400000, // 24 hours
});

/**
 * Manual cache control
 */
export const invalidateCache = (pattern) => {
  cacheStore.invalidatePattern(pattern);
};

export const clearCache = () => {
  cacheStore.clear();
};

export const getCacheStats = () => {
  return cacheStore.getStats();
};

/**
 * Cache headers middleware
 * Sets appropriate Cache-Control headers
 */
export const setCacheHeaders = (maxAge = 300) => {
  return (req, res, next) => {
    // Don't cache authenticated requests
    if (req.headers.authorization) {
      res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
      return next();
    }

    // Set cache headers for GET requests
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
      res.setHeader('Vary', 'Accept-Encoding');
    }

    next();
  };
};

/**
 * ETag support for conditional requests
 */
export const etagMiddleware = () => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Generate ETag from response data
      const etag = `"${Buffer.from(JSON.stringify(data)).toString('base64').substring(0, 27)}"`;

      res.setHeader('ETag', etag);

      // Check if client has the same version
      const clientETag = req.headers['if-none-match'];
      if (clientETag === etag) {
        return res.status(304).end();
      }

      return originalJson(data);
    };

    next();
  };
};

export default {
  cacheMiddleware,
  cacheFlightSearch,
  cacheAirportSearch,
  cacheStaticData,
  invalidateCache,
  clearCache,
  getCacheStats,
  setCacheHeaders,
  etagMiddleware,
};
