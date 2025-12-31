// server/routes/hotelRoutes.js
import express from 'express';
import * as hotelController from '../controllers/hotelController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All hotel booking routes require authentication
router.use(requireAuth);

/**
 * POST /api/hotel-bookings
 * Create a new hotel booking
 * Body: Complete hotel booking data including hotel details, guest info, dates
 */
router.post('/', hotelController.createHotelBooking);

/**
 * GET /api/hotel-bookings/user/:userId
 * Get all hotel bookings for a specific user
 * Params: userId - Firebase user ID
 */
router.get('/user/:userId', hotelController.getUserHotelBookings);

/**
 * GET /api/hotel-bookings/:id
 * Get a single hotel booking by ID
 * Params: id - Firestore hotel booking document ID
 */
router.get('/:id', hotelController.getHotelBookingById);

export default router;
