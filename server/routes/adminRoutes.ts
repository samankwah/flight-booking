/**
 * Admin Routes (TypeScript) - Admin panel and analytics endpoints
 */

import express, { RequestHandler } from 'express';
import * as adminController from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to cast async handlers to RequestHandler type
const asyncHandler = (fn: any): RequestHandler => fn;

// All admin routes require authentication and admin privileges
router.use(requireAuth as RequestHandler);
router.use(requireAdmin as RequestHandler);

// ==================== DASHBOARD & ANALYTICS ====================

/**
 * GET /api/admin/dashboard
 * Get comprehensive dashboard metrics
 */
router.get('/dashboard', asyncHandler(adminController.getDashboardMetrics));

/**
 * GET /api/admin/analytics/revenue
 * Get revenue statistics (replaces in-memory filtering)
 */
router.get('/analytics/revenue', asyncHandler(adminController.getRevenueStatistics));

/**
 * GET /api/admin/analytics/bookings
 * Get booking trends (replaces in-memory filtering)
 */
router.get('/analytics/bookings', asyncHandler(adminController.getBookingTrends));

/**
 * GET /api/admin/analytics/routes
 * Get popular flight routes
 */
router.get('/analytics/routes', asyncHandler(adminController.getPopularRoutes));

/**
 * GET /api/admin/analytics/conversions
 * Get conversion rates
 */
router.get('/analytics/conversions', asyncHandler(adminController.getConversionRates));

/**
 * GET /api/admin/analytics/realtime
 * Get real-time statistics
 */
router.get('/analytics/realtime', asyncHandler(adminController.getRealtimeStatistics));

// ==================== BOOKING MANAGEMENT ====================

/**
 * GET /api/admin/bookings
 * Get all bookings with filters and pagination
 */
router.get('/bookings', asyncHandler(adminController.getAllBookings));

/**
 * GET /api/admin/bookings/:id
 * Get single booking by ID
 */
router.get('/bookings/:id', asyncHandler(adminController.getBooking));

/**
 * PATCH /api/admin/bookings/:id
 * Update booking
 */
router.patch('/bookings/:id', asyncHandler(adminController.updateBooking));

/**
 * DELETE /api/admin/bookings/:id
 * Delete booking
 */
router.delete('/bookings/:id', asyncHandler(adminController.deleteBooking));

/**
 * POST /api/admin/bookings/:id/refund
 * Refund booking
 */
router.post('/bookings/:id/refund', asyncHandler(adminController.refundBooking));

// ==================== HOTEL BOOKINGS ====================

/**
 * GET /api/admin/hotel-bookings
 * Get all hotel bookings
 */
router.get('/hotel-bookings', asyncHandler(adminController.getAllHotelBookings));

// ==================== VISA APPLICATIONS ====================

/**
 * GET /api/admin/visa-applications
 * Get all visa applications
 */
router.get('/visa-applications', asyncHandler(adminController.getAllVisaApplications));

// ==================== STUDY ABROAD APPLICATIONS ====================

/**
 * GET /api/admin/applications
 * Get all study abroad applications
 */
router.get('/applications', asyncHandler(adminController.getAllStudyAbroadApplications));

// ==================== USER MANAGEMENT ====================

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', asyncHandler(adminController.getAllUsers));

/**
 * POST /api/admin/users/:userId/grant-admin
 * Grant admin privileges
 */
router.post('/users/:userId/grant-admin', asyncHandler(adminController.grantAdminPrivileges));

/**
 * POST /api/admin/users/:userId/revoke-admin
 * Revoke admin privileges
 */
router.post('/users/:userId/revoke-admin', asyncHandler(adminController.revokeAdminPrivileges));

/**
 * POST /api/admin/users/:userId/disable
 * Disable user account
 */
router.post('/users/:userId/disable', asyncHandler(adminController.disableUserAccount));

/**
 * POST /api/admin/users/:userId/enable
 * Enable user account
 */
router.post('/users/:userId/enable', asyncHandler(adminController.enableUserAccount));

// ==================== UNIVERSITY MANAGEMENT ====================

/**
 * GET /api/admin/universities/stats
 * Get university statistics
 */
router.get('/universities/stats', asyncHandler(adminController.getUniversityStatistics));

export default router;
