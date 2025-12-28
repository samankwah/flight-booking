// server/middleware/authMiddleware.js
import admin from '../config/firebase.js';

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

    // Attach user info to request for downstream use
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      emailVerified: decodedToken.email_verified || false
    };

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
