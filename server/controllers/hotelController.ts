/**
 * Hotel Booking Controller (TypeScript) - Hotel booking operations
 * Migrated from JavaScript to use HotelBookingService
 */

import { Request, Response, NextFunction } from 'express';
import { hotelBookingService } from '../services/firestore/HotelBookingService.js';
import { HotelBooking } from '../models/HotelBooking.js';
import { sendBookingEmail } from '../services/gmailEmailService.js';

interface AuthRequest extends Request {
  user: {
    uid: string;
    email?: string;
    admin?: boolean;
  };
}

export const createHotelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingData = req.body;
    const userId = req.user.uid;

    const booking = HotelBooking.createNew({
      ...bookingData,
      userId
    });

    const savedBooking = await hotelBookingService.create(booking);

    // Send confirmation email
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const bookingWithId = {
        id: savedBooking.id,
        ...savedBooking.toFirestore(),
        type: 'hotel'
      };

      const emailResult = await sendBookingEmail(bookingWithId, 'confirmed');
      emailSent = emailResult.success;

      if (!emailResult.success) {
        emailError = emailResult.message;
        console.warn('Email failed to send:', emailResult.message);
      }
    } catch (error) {
      console.error('Error sending hotel booking confirmation email:', error);
      emailError = error instanceof Error ? error.message : 'Unknown error';
    }

    res.status(201).json({
      success: true,
      message: 'Hotel booking created successfully',
      booking: savedBooking.toFirestore(),
      emailSent,
      emailError
    });
  } catch (error) {
    console.error('Error creating hotel booking:', error);
    next(error);
  }
};

export const getUserHotelBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.uid;

    if (userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own hotel bookings'
      });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;
    const paymentStatus = req.query.paymentStatus as any;

    const result = await hotelBookingService.getUserBookings(userId, {
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
    console.error('Error fetching user hotel bookings:', error);
    next(error);
  }
};

export const getHotelBookingById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.uid;

    const booking = await hotelBookingService.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Hotel booking not found'
      });
      return;
    }

    if (booking.userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own hotel bookings'
      });
      return;
    }

    res.json({
      success: true,
      booking: booking.toFirestore()
    });
  } catch (error) {
    console.error('Error fetching hotel booking:', error);
    next(error);
  }
};

export const cancelHotelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await hotelBookingService.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Hotel booking not found'
      });
      return;
    }

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
        error: 'Hotel booking cannot be cancelled (within 48 hours of check-in)'
      });
      return;
    }

    const cancelledBooking = await hotelBookingService.cancelBooking(id, reason);

    res.json({
      success: true,
      message: 'Hotel booking cancelled successfully',
      booking: cancelledBooking.toFirestore()
    });
  } catch (error) {
    console.error('Error cancelling hotel booking:', error);
    next(error);
  }
};

export const getHotelBookingStatistics = async (
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

    const stats = await hotelBookingService.getStatistics(dateRange);

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching hotel booking statistics:', error);
    next(error);
  }
};
