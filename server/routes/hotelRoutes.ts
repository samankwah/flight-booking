/**
 * Hotel Booking Routes (TypeScript)
 */

import express, { RequestHandler } from 'express';
import * as hotelController from '../controllers/hotelController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/zodValidation.js';
import { HotelBookingSchema } from '../schemas/hotel.schema.js';

const router = express.Router();

// Helper to cast async handlers to RequestHandler type
const asyncHandler = (fn: any): RequestHandler => fn;

router.use(requireAuth as RequestHandler);
router.use(bookingLimiter);

router.post('/', validateBody(HotelBookingSchema), asyncHandler(hotelController.createHotelBooking));
router.get('/user/:userId', asyncHandler(hotelController.getUserHotelBookings));
router.get('/stats', asyncHandler(hotelController.getHotelBookingStatistics));
router.get('/:id', asyncHandler(hotelController.getHotelBookingById));
router.post('/:id/cancel', asyncHandler(hotelController.cancelHotelBooking));

export default router;
