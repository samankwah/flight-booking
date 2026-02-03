/**
 * Booking Routes (TypeScript) - Flight booking endpoints
 * Migrated to use TypeScript controller and Zod validation
 */

import express, { RequestHandler } from 'express';
import * as bookingController from '../controllers/bookingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/zodValidation.js';
import { BookingSchema } from '../schemas/booking.schema.js';

const router = express.Router();

// Helper to cast async handlers to RequestHandler type
const asyncHandler = (fn: any): RequestHandler => fn;

// All booking routes require authentication and rate limiting
router.use(requireAuth as RequestHandler);
router.use(bookingLimiter);

/**
 * POST /api/bookings
 * Create a new booking
 * Body: Complete booking data including flight details, passenger info, payment info
 */
router.post(
  '/',
  validateBody(BookingSchema),
  asyncHandler(bookingController.createBooking)
);

/**
 * GET /api/bookings/user/:userId
 * Get all bookings for a specific user with pagination
 * Params: userId - Firebase user ID
 * Query: limit, startAfter, status, paymentStatus
 */
router.get('/user/:userId', asyncHandler(bookingController.getUserBookings));

/**
 * GET /api/bookings/stats
 * Get booking statistics (admin only)
 * Query: startDate, endDate
 */
router.get('/stats', asyncHandler(bookingController.getBookingStatistics));

/**
 * GET /api/bookings/popular-routes
 * Get popular flight routes (admin only)
 * Query: limit
 */
router.get('/popular-routes', asyncHandler(bookingController.getPopularRoutes));

/**
 * GET /api/bookings/:id
 * Get a single booking by ID
 * Params: id - Firestore booking document ID
 */
router.get('/:id', asyncHandler(bookingController.getBookingById));

/**
 * PUT /api/bookings/:id/status
 * Update booking status (admin only)
 * Body: { status, reason? }
 */
router.put('/:id/status', asyncHandler(bookingController.updateBookingStatus));

/**
 * POST /api/bookings/:id/payment
 * Mark booking as paid
 * Body: { paymentReference, paymentMethod }
 */
router.post('/:id/payment', asyncHandler(bookingController.markBookingAsPaid));

/**
 * POST /api/bookings/:id/cancel
 * Cancel a booking
 * Body: { reason? }
 */
router.post('/:id/cancel', asyncHandler(bookingController.cancelBooking));

export default router;
