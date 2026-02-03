/**
 * Booking Controller (TypeScript) - Flight booking operations
 * Migrated from JavaScript to use BookingService
 */

import { Request, Response, NextFunction } from 'express';
import { bookingService } from '../services/firestore/BookingService.js';
import { Booking } from '../models/Booking.js';
import { sendBookingEmail } from '../services/gmailEmailService.js';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user: {
    uid: string;
    email?: string;
    admin?: boolean;
  };
}

/**
 * Create a new booking
 * @route POST /api/bookings
 * @access Protected (requires auth)
 */
export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingData = req.body;
    const userId = req.user.uid;

    // Create booking model with authenticated user ID
    const booking = Booking.createNew({
      ...bookingData,
      userId // Override with authenticated user ID for security
    });

    // Validate and save to Firestore
    const savedBooking = await bookingService.create(booking);

    // Send confirmation email
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const bookingWithId = {
        id: savedBooking.id,
        ...savedBooking.toFirestore()
      };

      const emailResult = await sendBookingEmail(bookingWithId, 'confirmed');
      emailSent = emailResult.success;

      if (!emailResult.success) {
        emailError = emailResult.message;
        console.warn('Email failed to send:', emailResult.message);
      }
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      emailError = error instanceof Error ? error.message : 'Unknown error';
      // Don't fail the booking if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: savedBooking.toFirestore(),
      emailSent,
      emailError
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    next(error);
  }
};

/**
 * Get all bookings for a specific user with pagination
 * @route GET /api/bookings/user/:userId
 * @access Protected (requires auth)
 */
export const getUserBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.uid;

    // Users can only access their own bookings (unless admin)
    if (userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own bookings'
      });
      return;
    }

    // Extract pagination parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;
    const paymentStatus = req.query.paymentStatus as any;

    // Use BookingService with cursor-based pagination
    const result = await bookingService.getUserBookings(userId, {
      limit,
      startAfter: startAfter ? JSON.parse(startAfter) : undefined,
      status,
      paymentStatus
    });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      bookings: result.data.map(b => b.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);

    // Handle Firestore missing index error
    if ((error as any).code === 9 || (error as Error).message.includes('index')) {
      res.status(500).json({
        success: false,
        error: 'Database index required. Please check server logs for the index creation link.',
        details: (error as Error).message
      });
      return;
    }

    next(error);
  }
};

/**
 * Get a single booking by ID
 * @route GET /api/bookings/:id
 * @access Protected (requires auth)
 */
export const getBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.uid;

    // Fetch booking using BookingService
    const booking = await bookingService.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Users can only access their own bookings (unless admin)
    if (booking.userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own bookings'
      });
      return;
    }

    res.json({
      success: true,
      booking: booking.toFirestore()
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    next(error);
  }
};

/**
 * Update booking status (admin only)
 * @route PUT /api/bookings/:id/status
 * @access Protected (admin only)
 */
export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const booking = await bookingService.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Update status based on action
    let updatedBooking: Booking;

    switch (status) {
      case 'confirmed':
        updatedBooking = await bookingService.confirmBooking(id);
        break;
      case 'cancelled':
        updatedBooking = await bookingService.cancelBooking(id, req.body.reason);
        break;
      default:
        updatedBooking = await bookingService.update(id, { status });
    }

    res.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBooking.toFirestore()
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    next(error);
  }
};

/**
 * Mark booking as paid
 * @route POST /api/bookings/:id/payment
 * @access Protected
 */
export const markBookingAsPaid = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { paymentReference, paymentMethod } = req.body;

    if (!paymentReference || !paymentMethod) {
      res.status(400).json({
        success: false,
        error: 'Payment reference and method are required'
      });
      return;
    }

    const booking = await bookingService.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Users can only update their own bookings (unless admin)
    if (booking.userId !== req.user.uid && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only update your own bookings'
      });
      return;
    }

    const updatedBooking = await bookingService.markAsPaid(
      id,
      paymentReference,
      paymentMethod
    );

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      booking: updatedBooking.toFirestore()
    });
  } catch (error) {
    console.error('Error marking booking as paid:', error);
    next(error);
  }
};

/**
 * Cancel a booking
 * @route POST /api/bookings/:id/cancel
 * @access Protected
 */
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await bookingService.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    // Users can only cancel their own bookings (unless admin)
    if (booking.userId !== req.user.uid && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only cancel your own bookings'
      });
      return;
    }

    if (!booking.canCancel()) {
      res.status(400).json({
        success: false,
        error: 'Booking cannot be cancelled at this time'
      });
      return;
    }

    const cancelledBooking = await bookingService.cancelBooking(id, reason);

    // Send cancellation email
    try {
      const bookingWithId = {
        id: cancelledBooking.id,
        ...cancelledBooking.toFirestore()
      };
      await sendBookingEmail(bookingWithId, 'cancelled');
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: cancelledBooking.toFirestore()
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    next(error);
  }
};

/**
 * Get booking statistics (admin only)
 * @route GET /api/bookings/stats
 * @access Protected (admin only)
 */
export const getBookingStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;

    const stats = await bookingService.getStatistics(dateRange);

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    next(error);
  }
};

/**
 * Get popular routes (admin only)
 * @route GET /api/bookings/popular-routes
 * @access Protected (admin only)
 */
export const getPopularRoutes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const popularRoutes = await bookingService.getPopularRoutes(limit);

    res.json({
      success: true,
      routes: popularRoutes
    });
  } catch (error) {
    console.error('Error fetching popular routes:', error);
    next(error);
  }
};
