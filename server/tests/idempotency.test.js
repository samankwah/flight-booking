// tests/idempotency.test.js
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import {
  idempotencyMiddleware,
  clearIdempotencyCache,
  getIdempotencyCache,
  getIdempotencyCacheSize
} from '../middleware/idempotency.js';

describe('Idempotency Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    clearIdempotencyCache();
    req = {
      headers: {},
      body: { amount: 100, email: 'test@example.com' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((body) => {
        res._jsonBody = body;
        return res;
      }),
      statusCode: 200,
      _jsonBody: null,
    };
    next = jest.fn();
  });

  afterEach(() => {
    clearIdempotencyCache();
  });

  describe('Idempotency Key Validation', () => {
    it('should continue without idempotency check if no key provided', () => {
      idempotencyMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid idempotency key (too short)', () => {
      req.headers['x-idempotency-key'] = 'short';

      idempotencyMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid idempotency key',
        message: 'X-Idempotency-Key must be a string of at least 10 characters',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should accept valid idempotency key', () => {
      req.headers['x-idempotency-key'] = 'valid-key-123456';

      idempotencyMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('Duplicate Request Prevention', () => {
    it('should process first request normally', () => {
      req.headers['x-idempotency-key'] = 'unique-key-001';

      idempotencyMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(getIdempotencyCacheSize()).toBe(0); // Not cached yet until response
    });

    it('should cache response after first request', () => {
      req.headers['x-idempotency-key'] = 'unique-key-002';

      idempotencyMiddleware(req, res, next);

      // Simulate controller response
      res.json({ success: true, data: { id: 'txn123' } });

      const cached = getIdempotencyCache('unique-key-002');
      expect(cached).toBeDefined();
      expect(cached.response).toEqual({ success: true, data: { id: 'txn123' } });
      expect(cached.statusCode).toBe(200);
    });

    it('should return cached response for duplicate request', () => {
      const idempotencyKey = 'duplicate-key-003';
      req.headers['x-idempotency-key'] = idempotencyKey;

      // First request
      idempotencyMiddleware(req, res, next);
      res.json({ success: true, reference: 'ref123' });

      // Duplicate request with same key
      const req2 = { headers: { 'x-idempotency-key': idempotencyKey } };
      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next2 = jest.fn();

      idempotencyMiddleware(req2, res2, next2);

      // Should return cached response
      expect(res2.status).toHaveBeenCalledWith(200);
      expect(res2.json).toHaveBeenCalledWith({ success: true, reference: 'ref123' });
      expect(next2).not.toHaveBeenCalled();
    });

    it('should cache different status codes correctly', () => {
      req.headers['x-idempotency-key'] = 'error-key-004';

      idempotencyMiddleware(req, res, next);

      // Simulate error response
      res.statusCode = 400;
      res.json({ success: false, error: 'Invalid amount' });

      const cached = getIdempotencyCache('error-key-004');
      expect(cached.statusCode).toBe(400);
      expect(cached.response.success).toBe(false);

      // Duplicate request
      const req2 = { headers: { 'x-idempotency-key': 'error-key-004' } };
      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      idempotencyMiddleware(req2, res2, jest.fn());

      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.json).toHaveBeenCalledWith({ success: false, error: 'Invalid amount' });
    });
  });

  describe('Cache Management', () => {
    it('should track cache size correctly', () => {
      expect(getIdempotencyCacheSize()).toBe(0);

      req.headers['x-idempotency-key'] = 'key1';
      idempotencyMiddleware(req, res, next);
      res.json({ data: 1 });

      expect(getIdempotencyCacheSize()).toBe(1);

      const req2 = { headers: { 'x-idempotency-key': 'key2' } };
      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn((body) => {
          res2._jsonBody = body;
          return res2;
        }),
      };
      idempotencyMiddleware(req2, res2, jest.fn());
      res2.json({ data: 2 });

      expect(getIdempotencyCacheSize()).toBe(2);
    });

    it('should clear entire cache', () => {
      req.headers['x-idempotency-key'] = 'key-to-clear';
      idempotencyMiddleware(req, res, next);
      res.json({ data: 'test' });

      expect(getIdempotencyCacheSize()).toBe(1);

      clearIdempotencyCache();

      expect(getIdempotencyCacheSize()).toBe(0);
    });

    it('should clear specific key from cache', () => {
      req.headers['x-idempotency-key'] = 'specific-key';
      idempotencyMiddleware(req, res, next);
      res.json({ data: 'test' });

      expect(getIdempotencyCache('specific-key')).toBeDefined();

      clearIdempotencyCache('specific-key');

      expect(getIdempotencyCache('specific-key')).toBeUndefined();
    });

    it('should store timestamp with cached response', () => {
      req.headers['x-idempotency-key'] = 'timestamp-key';

      const beforeTime = Date.now();
      idempotencyMiddleware(req, res, next);
      res.json({ data: 'test' });
      const afterTime = Date.now();

      const cached = getIdempotencyCache('timestamp-key');
      expect(cached.timestamp).toBeGreaterThanOrEqual(beforeTime);
      expect(cached.timestamp).toBeLessThanOrEqual(afterTime);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple concurrent requests with same key', () => {
      const idempotencyKey = 'concurrent-key';

      // First request starts but hasn't responded yet
      req.headers['x-idempotency-key'] = idempotencyKey;
      idempotencyMiddleware(req, res, next);

      // Second request comes in before first completes
      const req2 = { headers: { 'x-idempotency-key': idempotencyKey } };
      const res2 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next2 = jest.fn();

      idempotencyMiddleware(req2, res2, next2);

      // Second request should proceed (no cache yet)
      expect(next2).toHaveBeenCalled();

      // First request completes
      res.json({ success: true, id: 'first' });

      // Third request after first completes
      const req3 = { headers: { 'x-idempotency-key': idempotencyKey } };
      const res3 = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      idempotencyMiddleware(req3, res3, jest.fn());

      // Third request should get cached response
      expect(res3.json).toHaveBeenCalledWith({ success: true, id: 'first' });
    });

    it('should handle empty response body', () => {
      req.headers['x-idempotency-key'] = 'empty-response-key';

      idempotencyMiddleware(req, res, next);
      res.json({});

      const cached = getIdempotencyCache('empty-response-key');
      expect(cached.response).toEqual({});
    });

    it('should preserve original res.json function', () => {
      const originalJson = res.json;
      req.headers['x-idempotency-key'] = 'preserve-key';

      idempotencyMiddleware(req, res, next);

      expect(res.json).toBeDefined();
      expect(typeof res.json).toBe('function');
      expect(res.json).not.toBe(originalJson);
    });
  });

  describe('Production Considerations', () => {
    it('should handle UUID-format idempotency keys', () => {
      req.headers['x-idempotency-key'] = '550e8400-e29b-41d4-a716-446655440000';

      idempotencyMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should handle long idempotency keys', () => {
      req.headers['x-idempotency-key'] = 'a'.repeat(100);

      idempotencyMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
