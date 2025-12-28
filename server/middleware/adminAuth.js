// server/middleware/adminAuth.js
import { auth } from '../config/firebase.js';

/**
 * Middleware to verify admin authentication
 * Checks for valid Firebase ID token and admin custom claim
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    // Extract token
    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token format'
      });
    }

    // Verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token'
      });
    }

    // Check admin claim
    if (!decodedToken.admin) {
      console.warn(`Access denied for user ${decodedToken.uid} - not an admin`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required. You do not have permission to access this resource.'
      });
    }

    // Attach user info to request object for use in controllers
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: true,
      emailVerified: decodedToken.email_verified
    };

    console.log(`✅ Admin access granted for user: ${decodedToken.email}`);
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication check failed'
    });
  }
};

/**
 * Optional: Middleware to check if user is authenticated (not necessarily admin)
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split('Bearer ')[1];

    const decodedToken = await auth.verifyIdToken(token);

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      admin: decodedToken.admin === true,
      emailVerified: decodedToken.email_verified
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Optional: Middleware to attach user if authenticated, but don't require it
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        admin: decodedToken.admin === true,
        emailVerified: decodedToken.email_verified
      };
    }

    next();
  } catch (error) {
    // Fail silently - user just won't be attached
    next();
  }
};
