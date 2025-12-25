// server/middleware/auth.js
import jwt from 'jsonwebtoken';
import { auth as firebaseAuth, isFirebaseAvailable } from '../config/firebase.js';

/**
 * JWT Authentication Middleware
 * Verifies Firebase ID tokens or JWT tokens from Authorization header
 *
 * Priority:
 * 1. If Firebase is available, verify using Firebase Admin SDK (most secure)
 * 2. Otherwise, verify using JWT_SECRET (for custom JWT tokens)
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  try {
    let decoded;

    // Try Firebase ID token verification first (if available)
    if (isFirebaseAvailable) {
      try {
        decoded = await firebaseAuth.verifyIdToken(token);
        req.user = decoded;
        return next();
      } catch (firebaseError) {
        // If Firebase verification fails, fall through to JWT verification
        console.warn('Firebase token verification failed, trying JWT:', firebaseError.message);
      }
    }

    // Fallback to JWT verification with secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured and Firebase unavailable');
      return res.status(500).json({
        error: 'Authentication configuration error',
        message: 'Server authentication is not properly configured'
      });
    }

    decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validate required token claims
    if (!decoded || !decoded.exp) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token missing required claims'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your authentication token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Authentication token is invalid'
      });
    } else {
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Authentication error',
        message: 'An error occurred during authentication'
      });
    }
  }
};

/**
 * Optional authentication middleware
 * Allows requests without tokens but attaches user info if token is valid
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      let decoded;

      // Try Firebase verification first if available
      if (isFirebaseAvailable) {
        try {
          decoded = await firebaseAuth.verifyIdToken(token);
          req.user = decoded;
          return next();
        } catch (firebaseError) {
          // Fall through to JWT verification
        }
      }

      // Try JWT verification
      if (process.env.JWT_SECRET) {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
      console.warn('Invalid token in optional auth:', error.message);
    }
  }

  next();
};

/**
 * Role-based authorization middleware factory
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be authenticated to access this resource'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This resource requires ${requiredRole} role`
      });
    }

    next();
  };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole('admin');

/**
 * User ownership middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be authenticated to access this resource'
      });
    }

    const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];

    if (!resourceUserId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Resource user ID is required for ownership verification'
      });
    }

    if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

/**
 * API Key authentication middleware
 * For server-to-server communication
 */
export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      message: 'Please provide a valid API key'
    });
  }

  // In production, you should validate against a database or secure store
  const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  req.apiKey = apiKey;
  next();
};
