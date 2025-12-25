// server/controllers/authController.js
import jwt from 'jsonwebtoken';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp } from 'firebase-admin/app';

const firebaseApp = initializeApp({
  projectId: process.env.FIREBASE_PROJECT_ID,
});

/**
 * Verify Firebase ID token and generate JWT
 */
export const login = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: 'ID token required',
        message: 'Firebase ID token is required for authentication'
      });
    }

    // Verify Firebase ID token
    const decodedToken = await getAuth(firebaseApp).verifyIdToken(idToken);

    // Generate JWT token
    const jwtToken = jwt.sign(
      {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        role: 'user', // Default role, could be enhanced with database lookup
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '24h', // Token expires in 24 hours
        issuer: 'flight-booking-api',
        audience: 'flight-booking-client'
      }
    );

    res.json({
      success: true,
      token: jwtToken,
      user: {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        role: 'user'
      },
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Authentication error:', error);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'The provided ID token has expired'
      });
    } else if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token revoked',
        message: 'The provided ID token has been revoked'
      });
    }

    res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid authentication credentials'
    });
  }
};

/**
 * Refresh JWT token
 */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: tokenToRefresh } = req.body;

    if (!tokenToRefresh) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Refresh token is required'
      });
    }

    // Verify the refresh token
    const decoded = jwt.verify(tokenToRefresh, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'your-secret-key');

    // Generate new JWT token
    const newToken = jwt.sign(
      {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      {
        expiresIn: '24h',
        issuer: 'flight-booking-api',
        audience: 'flight-booking-client'
      }
    );

    res.json({
      success: true,
      token: newToken,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: 'Invalid or expired refresh token'
    });
  }
};

/**
 * Verify JWT token (middleware helper)
 */
export const verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        error: 'Token required',
        message: 'Authentication token is required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    res.json({
      success: true,
      valid: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      valid: false,
      error: 'Invalid token'
    });
  }
};
