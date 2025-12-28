// server/routes/bookingRoutes.js
import express from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All booking routes require authentication
router.use(requireAuth);

/**
 * POST /api/bookings
 * Create a new booking
 * Body: Complete booking data including flight details, passenger info, payment info
 */
router.post('/', bookingController.createBooking);

/**
 * GET /api/bookings/user/:userId
 * Get all bookings for a specific user
 * Params: userId - Firebase user ID
 */
router.get('/user/:userId', bookingController.getUserBookings);

/**
 * GET /api/bookings/:id
 * Get a single booking by ID
 * Params: id - Firestore booking document ID
 */
router.get('/:id', bookingController.getBookingById);

export default router;
