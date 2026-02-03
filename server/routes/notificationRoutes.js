// server/routes/notificationRoutes.js

import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { notificationLimiter } from '../middleware/rateLimiter.js';
import { validate, notificationPreferencesSchema } from '../middleware/validation.js';
import {
  subscribe,
  unsubscribe,
  getPreferences,
  updatePreferences,
  sendNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// All routes require authentication and rate limiting
router.use(notificationLimiter);
router.use(requireAuth);

/**
 * @route   POST /api/notifications/subscribe
 * @desc    Subscribe to push notifications
 * @access  Private
 */
router.post('/subscribe', subscribe);

/**
 * @route   POST /api/notifications/unsubscribe
 * @desc    Unsubscribe from push notifications
 * @access  Private
 */
router.post('/unsubscribe', unsubscribe);

/**
 * @route   GET /api/notifications/preferences
 * @desc    Get user notification preferences
 * @access  Private
 */
router.get('/preferences', getPreferences);

/**
 * @route   PUT /api/notifications/preferences
 * @desc    Update user notification preferences
 * @access  Private
 */
router.put('/preferences', validate(notificationPreferencesSchema), updatePreferences);

/**
 * @route   POST /api/notifications/send
 * @desc    Send push notification (admin only)
 * @access  Private
 */
router.post('/send', sendNotification);

export default router;
