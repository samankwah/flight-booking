// tests/authMiddleware.test.js
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireOwnership,
  authenticateApiKey
} from '../middleware/authMiddleware.js';

// Mock Firebase Admin
jest.mock('../config/firebase.js', () => ({
  __esModule: true,
  default: {
    auth: () => ({
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
    }),
  },
}));

import admin from '../config/firebase.js';

describe('Authentication Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireAuth', () => {
    it('should authenticate valid Firebase token', async () => {
      req.headers.authorization = 'Bearer valid-token';

      admin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'user123',
        email: 'test@example.com',
        email_verified: true,
      });

      admin.auth().getUser.mockResolvedValueOnce({
        customClaims: { role: 'user', admin: false },
      });

      await requireAuth(req, res, next);

      expect(admin.auth().verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(req.user).toEqual({
        uid: 'user123',
        email: 'test@example.com',
        name: null,
        emailVerified: true,
        role: 'user',
        admin: false,
      });
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized: No authentication token provided',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token format', async () => {
      req.headers.authorization = 'InvalidFormat token';

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized: No authentication token provided',
      });
    });

    it('should handle expired token', async () => {
      req.headers.authorization = 'Bearer expired-token';

      const error = new Error('Token expired');
      error.code = 'auth/id-token-expired';
      admin.auth().verifyIdToken.mockRejectedValueOnce(error);

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized: Token has expired',
      });
    });

    it('should handle invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      const error = new Error('Invalid token');
      error.code = 'auth/argument-error';
      admin.auth().verifyIdToken.mockRejectedValueOnce(error);

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Unauthorized: Invalid token',
      });
    });

    it('should attach admin role from custom claims', async () => {
      req.headers.authorization = 'Bearer admin-token';

      admin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'admin123',
        email: 'admin@example.com',
        email_verified: true,
      });

      admin.auth().getUser.mockResolvedValueOnce({
        customClaims: { role: 'admin', admin: true },
      });

      await requireAuth(req, res, next);

      expect(req.user.role).toBe('admin');
      expect(req.user.admin).toBe(true);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should attach user if valid token provided', async () => {
      req.headers.authorization = 'Bearer valid-token';

      admin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'user123',
        email: 'test@example.com',
      });

      admin.auth().getUser.mockResolvedValueOnce({
        customClaims: {},
      });

      await optionalAuth(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.uid).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('should continue without user if no token provided', async () => {
      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should continue without user if invalid token provided', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      admin.auth().verifyIdToken.mockRejectedValueOnce(new Error('Invalid'));

      await optionalAuth(req, res, next);

      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should allow admin user', () => {
      req.user = { uid: 'admin123', role: 'admin', admin: true };

      requireAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject non-admin user', () => {
      req.user = { uid: 'user123', role: 'user', admin: false };

      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Admin access required',
        message: 'This resource is restricted to administrators only',
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated request', () => {
      requireAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      req.user = { uid: 'user123', role: 'moderator' };

      const middleware = requireRole('moderator');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user with incorrect role', () => {
      req.user = { uid: 'user123', role: 'user' };

      const middleware = requireRole('moderator');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Insufficient permissions',
        message: 'This resource requires moderator role',
      });
    });
  });

  describe('requireOwnership', () => {
    it('should allow user to access their own resource', () => {
      req.user = { uid: 'user123', role: 'user' };
      req.params.userId = 'user123';

      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user trying to access another user resource', () => {
      req.user = { uid: 'user123', role: 'user', admin: false };
      req.params.userId = 'user456';

      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Access denied',
        message: 'You can only access your own resources',
      });
    });

    it('should allow admin to access any resource', () => {
      req.user = { uid: 'admin123', role: 'admin', admin: true };
      req.params.userId = 'user456';

      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should check userId in body, params, and query', () => {
      req.user = { uid: 'user123', role: 'user' };
      req.body.userId = 'user123';

      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return error if userId not found', () => {
      req.user = { uid: 'user123', role: 'user' };

      const middleware = requireOwnership('userId');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'User ID required',
        message: 'Resource user ID is required for ownership verification',
      });
    });
  });

  describe('authenticateApiKey', () => {
    beforeEach(() => {
      process.env.VALID_API_KEYS = 'key1,key2,key3';
    });

    it('should authenticate with valid API key in header', () => {
      req.headers['x-api-key'] = 'key1';

      authenticateApiKey(req, res, next);

      expect(req.apiKey).toBe('key1');
      expect(next).toHaveBeenCalled();
    });

    it('should authenticate with valid API key in query', () => {
      req.query.apiKey = 'key2';

      authenticateApiKey(req, res, next);

      expect(req.apiKey).toBe('key2');
      expect(next).toHaveBeenCalled();
    });

    it('should reject invalid API key', () => {
      req.headers['x-api-key'] = 'invalid-key';

      authenticateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
      });
    });

    it('should reject missing API key', () => {
      authenticateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'API key required',
        message: 'Please provide a valid API key',
      });
    });

    it('should handle missing VALID_API_KEYS config', () => {
      delete process.env.VALID_API_KEYS;
      req.headers['x-api-key'] = 'any-key';

      authenticateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'API key authentication not configured',
        message: 'Server API key authentication is not properly configured',
      });
    });
  });
});
