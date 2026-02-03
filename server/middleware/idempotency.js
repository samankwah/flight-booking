// server/middleware/idempotency.js

/**
 * In-memory idempotency store (for demo purposes)
 * In production, use Redis or database with TTL
 */
const idempotencyStore = new Map();

// Clean up old keys every 30 minutes
setInterval(() => {
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000; // 24 hours

  for (const [key, value] of idempotencyStore.entries()) {
    if (now - value.timestamp > ttl) {
      idempotencyStore.delete(key);
    }
  }
}, 30 * 60 * 1000);

/**
 * Idempotency middleware for payment requests
 * Prevents duplicate payment processing using idempotency keys
 *
 * Usage: Add to payment routes that should be idempotent
 * Client should send X-Idempotency-Key header with unique key per request
 */
export const idempotencyMiddleware = (req, res, next) => {
  const idempotencyKey = req.headers['x-idempotency-key'];

  // If no idempotency key provided, continue without idempotency check
  // (Optional: Make it required by returning 400 error instead)
  if (!idempotencyKey) {
    return next();
  }

  // Validate idempotency key format (UUID recommended)
  if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Invalid idempotency key',
      message: 'X-Idempotency-Key must be a string of at least 10 characters'
    });
  }

  // Check if this key has been used before
  const cached = idempotencyStore.get(idempotencyKey);

  if (cached) {
    // Return cached response
    console.log(`Idempotent request detected: ${idempotencyKey}`);
    return res.status(cached.statusCode).json(cached.response);
  }

  // Store original res.json to intercept the response
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    // Cache the response for future identical requests
    idempotencyStore.set(idempotencyKey, {
      statusCode: res.statusCode || 200,
      response: body,
      timestamp: Date.now()
    });

    // Send the response
    return originalJson(body);
  };

  next();
};

/**
 * Get stored idempotency response (for testing/debugging)
 */
export const getIdempotencyCache = (key) => {
  return idempotencyStore.get(key);
};

/**
 * Clear idempotency cache (for testing/debugging)
 */
export const clearIdempotencyCache = (key) => {
  if (key) {
    return idempotencyStore.delete(key);
  }
  idempotencyStore.clear();
  return true;
};

/**
 * Get cache size (for monitoring)
 */
export const getIdempotencyCacheSize = () => {
  return idempotencyStore.size;
};
