/**
 * Holiday Package Routes (TypeScript)
 */

import express, { RequestHandler } from 'express';
import * as holidayController from '../controllers/holidayController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { bookingLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/zodValidation.js';
import { HolidayPackageBookingSchema } from '../schemas/holiday.schema.js';

const router = express.Router();

// Helper to cast async handlers to RequestHandler type
const asyncHandler = (fn: any): RequestHandler => fn;

router.use(requireAuth as RequestHandler);
router.use(bookingLimiter);

router.post('/', validateBody(HolidayPackageBookingSchema), asyncHandler(holidayController.createHolidayBooking));
router.get('/user/:userId', asyncHandler(holidayController.getUserHolidayBookings));
router.get('/stats', asyncHandler(holidayController.getHolidayBookingStatistics));
router.get('/:id', asyncHandler(holidayController.getHolidayBookingById));
router.post('/:id/cancel', asyncHandler(holidayController.cancelHolidayBooking));

export default router;
