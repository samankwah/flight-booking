/**
 * Admin Controller (TypeScript) - Admin operations and analytics
 * Migrated from JavaScript to use AnalyticsService (replaces in-memory filtering)
 */

import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/firestore/AnalyticsService.js';
import { bookingService } from '../services/firestore/BookingService.js';
import { hotelBookingService } from '../services/firestore/HotelBookingService.js';
import { visaApplicationService } from '../services/firestore/VisaApplicationService.js';
import { applicationService } from '../services/firestore/ApplicationService.js';
import { universityService } from '../services/firestore/UniversityService.js';
import { userService } from '../services/firestore/UserService.js';
import { sendBookingEmail } from '../services/gmailEmailService.js';

interface AuthRequest extends Request {
  user: {
    uid: string;
    email?: string;
    admin?: boolean;
  };
}

// ==================== DASHBOARD & ANALYTICS ====================

/**
 * Get comprehensive dashboard metrics
 * @route GET /api/admin/dashboard
 * REPLACES in-memory filtering with efficient Firestore queries
 */
export const getDashboardMetrics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;

    // Use AnalyticsService - replaces fetching ALL documents
    const metrics = await analyticsService.getDashboardMetrics(dateRange);

    res.json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    next(error);
  }
};

/**
 * Get revenue statistics
 * @route GET /api/admin/analytics/revenue
 * REPLACES in-memory filtering (old lines 377-442)
 */
export const getRevenueStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;

    // Use AnalyticsService instead of fetching ALL bookings and filtering in memory
    const stats = await analyticsService.getRevenueStatistics(dateRange);

    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    next(error);
  }
};

/**
 * Get booking trends
 * @route GET /api/admin/analytics/bookings
 * REPLACES in-memory filtering (old lines 448-528)
 */
export const getBookingTrends = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string) : 30;

    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Use AnalyticsService instead of fetching ALL documents
    const trends = await analyticsService.getBookingTrends({ start: startDate, end: endDate });

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Booking trends error:', error);
    next(error);
  }
};

/**
 * Get popular routes
 * @route GET /api/admin/analytics/routes
 * REPLACES in-memory aggregation
 */
export const getPopularRoutes = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;

    // Use AnalyticsService
    const routes = await analyticsService.getPopularRoutes({ limit, dateRange });

    res.json({
      success: true,
      routes
    });
  } catch (error) {
    console.error('Popular routes error:', error);
    next(error);
  }
};

/**
 * Get conversion rates
 * @route GET /api/admin/analytics/conversions
 */
export const getConversionRates = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;

    const conversions = await analyticsService.getConversionRates(dateRange);

    res.json({
      success: true,
      conversions
    });
  } catch (error) {
    console.error('Conversion rates error:', error);
    next(error);
  }
};

/**
 * Get real-time statistics
 * @route GET /api/admin/analytics/realtime
 */
export const getRealtimeStatistics = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await analyticsService.getRealtimeStatistics();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Realtime stats error:', error);
    next(error);
  }
};

// ==================== BOOKING MANAGEMENT ====================

/**
 * Get all bookings with filters and pagination
 * @route GET /api/admin/bookings
 */
export const getAllBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;
    const paymentStatus = req.query.paymentStatus as any;

    const result = await bookingService.findPaginated({
      where: [
        ...(status ? [{ field: 'status' as const, operator: '==' as const, value: status }] : []),
        ...(paymentStatus ? [{ field: 'paymentStatus' as const, operator: '==' as const, value: paymentStatus }] : [])
      ],
      orderBy: [{ field: 'bookingDate' as const, direction: 'desc' as const }],
      limit,
      startAfter: startAfter ? JSON.parse(startAfter) : undefined
    });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      bookings: result.data.map(b => b.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    next(error);
  }
};

/**
 * Get single booking by ID
 * @route GET /api/admin/bookings/:id
 */
export const getBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.findById(id);

    if (!booking) {
      res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      booking: booking.toFirestore()
    });
  } catch (error) {
    console.error('Get booking error:', error);
    next(error);
  }
};

/**
 * Update booking
 * @route PATCH /api/admin/bookings/:id
 */
export const updateBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData: any = {};

    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedBooking = await bookingService.update(id, updateData);

    // Send email notification if status changed
    if (status) {
      try {
        const bookingWithId = {
          id: updatedBooking.id,
          ...updatedBooking.toFirestore()
        };
        await sendBookingEmail(bookingWithId, status);
      } catch (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the update if email fails
      }
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      booking: updatedBooking.toFirestore()
    });
  } catch (error) {
    console.error('Update booking error:', error);
    next(error);
  }
};

/**
 * Delete booking
 * @route DELETE /api/admin/bookings/:id
 */
export const deleteBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await bookingService.delete(id);

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    next(error);
  }
};

/**
 * Refund booking
 * @route POST /api/admin/bookings/:id/refund
 */
export const refundBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const updatedBooking = await bookingService.update(id, {
      status: 'refunded',
      paymentStatus: 'refunded',
      refundDate: new Date().toISOString()
    });

    // Send refund email
    try {
      const bookingWithId = {
        id: updatedBooking.id,
        ...updatedBooking.toFirestore()
      };
      await sendBookingEmail(bookingWithId, 'refunded');
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking refunded successfully'
    });
  } catch (error) {
    console.error('Refund booking error:', error);
    next(error);
  }
};

// ==================== HOTEL BOOKINGS ====================

/**
 * Get all hotel bookings
 * @route GET /api/admin/hotel-bookings
 */
export const getAllHotelBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;

    const result = await hotelBookingService.getBookingsByStatus(status || 'confirmed', {
      limit,
      startAfter: startAfter ? JSON.parse(startAfter) : undefined
    });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      bookings: result.data.map(b => b.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Get hotel bookings error:', error);
    next(error);
  }
};

// ==================== VISA APPLICATIONS ====================

/**
 * Get all visa applications
 * @route GET /api/admin/visa-applications
 */
export const getAllVisaApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;

    const result = status
      ? await visaApplicationService.getApplicationsByStatus(status, {
          limit,
          startAfter: startAfter ? JSON.parse(startAfter) : undefined
        })
      : await visaApplicationService.findPaginated({
          orderBy: [{ field: 'submittedAt' as const, direction: 'desc' as const }],
          limit,
          startAfter: startAfter ? JSON.parse(startAfter) : undefined
        });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      applications: result.data.map(a => a.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Get visa applications error:', error);
    next(error);
  }
};

// ==================== STUDY ABROAD APPLICATIONS ====================

/**
 * Get all study abroad applications
 * @route GET /api/admin/applications
 */
export const getAllStudyAbroadApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;

    const result = status
      ? await applicationService.getApplicationsByStatus(status, {
          limit,
          startAfter: startAfter ? JSON.parse(startAfter) : undefined
        })
      : await applicationService.findPaginated({
          orderBy: [{ field: 'workflow.submittedAt' as const, direction: 'desc' as const }],
          limit,
          startAfter: startAfter ? JSON.parse(startAfter) : undefined
        });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      applications: result.data.map(a => a.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Get study abroad applications error:', error);
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 * @route GET /api/admin/users
 */
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const startAfter = req.query.startAfter as string | undefined;
    const includeDisabled = req.query.includeDisabled === 'true';

    const result = await userService.getAllUsers({
      limit,
      startAfter: startAfter ? JSON.parse(startAfter) : undefined,
      includeDisabled
    });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      users: result.data.map(u => u.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Get users error:', error);
    next(error);
  }
};

/**
 * Grant admin privileges
 * @route POST /api/admin/users/:userId/grant-admin
 */
export const grantAdminPrivileges = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    await userService.grantAdmin(userId);

    res.json({
      success: true,
      message: 'Admin privileges granted successfully'
    });
  } catch (error) {
    console.error('Grant admin error:', error);
    next(error);
  }
};

/**
 * Revoke admin privileges
 * @route POST /api/admin/users/:userId/revoke-admin
 */
export const revokeAdminPrivileges = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    await userService.revokeAdmin(userId);

    res.json({
      success: true,
      message: 'Admin privileges revoked successfully'
    });
  } catch (error) {
    console.error('Revoke admin error:', error);
    next(error);
  }
};

/**
 * Disable user account
 * @route POST /api/admin/users/:userId/disable
 */
export const disableUserAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    await userService.disableUser(userId);

    res.json({
      success: true,
      message: 'User account disabled successfully'
    });
  } catch (error) {
    console.error('Disable user error:', error);
    next(error);
  }
};

/**
 * Enable user account
 * @route POST /api/admin/users/:userId/enable
 */
export const enableUserAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    await userService.enableUser(userId);

    res.json({
      success: true,
      message: 'User account enabled successfully'
    });
  } catch (error) {
    console.error('Enable user error:', error);
    next(error);
  }
};

// ==================== UNIVERSITY MANAGEMENT ====================

/**
 * Get university statistics
 * @route GET /api/admin/universities/stats
 */
export const getUniversityStatistics = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await universityService.getStatistics();

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('University stats error:', error);
    next(error);
  }
};
