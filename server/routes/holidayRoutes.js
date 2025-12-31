// server/routes/holidayRoutes.js
import express from 'express';
import * as holidayController from '../controllers/holidayController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All holiday package booking routes require authentication
router.use(requireAuth);

/**
 * POST /api/holiday-package-bookings
 * Create a new holiday package booking
 * Body: Complete holiday package booking data including package details, traveler info
 */
router.post('/', holidayController.createHolidayPackageBooking);

/**
 * GET /api/holiday-package-bookings/user/:userId
 * Get all holiday package bookings for a specific user
 * Params: userId - Firebase user ID
 */
router.get('/user/:userId', holidayController.getUserHolidayPackageBookings);

/**
 * GET /api/holiday-package-bookings/:id
 * Get a single holiday package booking by ID
 * Params: id - Firestore holiday package booking document ID
 */
router.get('/:id', holidayController.getHolidayPackageBookingById);

export default router;
