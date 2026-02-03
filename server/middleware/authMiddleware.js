// server/middleware/authMiddleware.js
import admin from '../config/firebase.js';
import Sentry from '../instrument.js';

// Helper to set user context in Sentry
const setSentryUser = (user) => {
  Sentry.setUser({
    id: user.uid,
    email: user.email,
    username: user.name,
  });
};

/**
 * Middleware to require authentication for protected routes
 * Verifies Firebase ID token and attaches user info to request
 */
export const requireAuth = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No authentication token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token format'
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Get user's custom claims (for admin role, etc.)
    const userRecord = await admin.auth().getUser(decodedToken.uid);
    const customClaims = userRecord.customClaims || {};

    // Attach user info to request for downstream use
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      emailVerified: decodedToken.email_verified || false,
      role: customClaims.role || 'user',
      admin: customClaims.admin || false
    };

    // Set user context in Sentry for error tracking
    setSentryUser(req.user);

    next();
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token has expired'
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token'
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication failed'
    });
  }
};

/**
 * Optional authentication middleware
 * Allows requests without tokens but attaches user info if token is valid
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null;

  if (token) {
    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Get user's custom claims
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      const customClaims = userRecord.customClaims || {};

      // Attach user info to request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email || null,
        name: decodedToken.name || null,
        emailVerified: decodedToken.email_verified || false,
        role: customClaims.role || 'user',
        admin: customClaims.admin || false
      };

      // Set user context in Sentry
      setSentryUser(req.user);
    } catch (error) {
      // Silently ignore invalid tokens for optional auth
      console.warn('Invalid token in optional auth:', error.message);
    }
  }

  next();
};

/**
 * Role-based authorization middleware factory
 * Requires specific role to access the route
 * MUST be used after requireAuth middleware
 *
 * @param {string} requiredRole - The role required to access the route
 * @returns {Function} Express middleware function
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be authenticated to access this resource'
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This resource requires ${requiredRole} role`
      });
    }

    next();
  };
};

/**
 * Admin-only middleware
 * Requires user to have admin role or admin custom claim
 * MUST be used after requireAuth middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'You must be authenticated to access this resource'
    });
  }

  // Check both role and admin flag for backwards compatibility
  if (req.user.role !== 'admin' && !req.user.admin) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
      message: 'This resource is restricted to administrators only'
    });
  }

  next();
};

/**
 * User ownership middleware
 * Ensures user can only access their own resources (unless they're admin)
 * MUST be used after requireAuth middleware
 *
 * @param {string} userIdField - The field name containing the user ID (default: 'userId')
 * @returns {Function} Express middleware function
 */
export const requireOwnership = (userIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be authenticated to access this resource'
      });
    }

    // Check body, params, and query for the user ID
    const resourceUserId = req.body[userIdField] || req.params[userIdField] || req.query[userIdField];

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        error: 'User ID required',
        message: 'Resource user ID is required for ownership verification'
      });
    }

    // Allow access if user owns the resource OR is an admin
    if (req.user.uid !== resourceUserId && req.user.role !== 'admin' && !req.user.admin) {
      return res.status(403).json({
        success: false,
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
 * Validates API key from header or query parameter
 */
export const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide a valid API key'
    });
  }

  // Validate against environment variable list
  const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];

  if (validApiKeys.length === 0) {
    console.warn('WARNING: No VALID_API_KEYS configured in environment');
    return res.status(500).json({
      success: false,
      error: 'API key authentication not configured',
      message: 'Server API key authentication is not properly configured'
    });
  }

  if (!validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  req.apiKey = apiKey;
  next();
};
