// server/routes/adminRoutes.js
import express from 'express';
import { requireAdmin } from '../middleware/adminAuth.js';
import { adminLimiter } from '../middleware/rateLimiter.js';
import { validate, validateQuery, adminUserUpdateSchema, paginationSchema } from '../middleware/validation.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// Apply admin authentication and rate limiting middleware to all routes
router.use(requireAdmin);
router.use(adminLimiter);

// ==================== BOOKING MANAGEMENT ====================
router.get('/bookings', validateQuery(paginationSchema), adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBooking);
router.patch('/bookings/:id', adminController.updateBooking);
router.delete('/bookings/:id', adminController.deleteBooking);
router.post('/bookings/:id/refund', adminController.refundBooking);
router.post('/bookings/:id/notes', adminController.addBookingNote);

// ==================== USER MANAGEMENT ====================
router.get('/users', validateQuery(paginationSchema), adminController.getAllUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/admin', validate(adminUserUpdateSchema), adminController.setAdminStatus);
router.patch('/users/:id/disable', adminController.disableUserAccount);
router.get('/users/:id/bookings', adminController.getUserBookings);

// ==================== ANALYTICS ====================
router.get('/analytics/revenue', adminController.getRevenueStats);
router.get('/analytics/bookings', adminController.getBookingTrends);
router.get('/analytics/routes', adminController.getPopularRoutes);
router.get('/analytics/dashboard', adminController.getDashboardStats);

// ==================== OFFER MANAGEMENT ====================
router.get('/offers', adminController.getAllOffers);
router.get('/offers/:id', adminController.getOffer);
router.post('/offers', adminController.createOffer);
router.patch('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);
router.patch('/offers/:id/toggle', adminController.toggleOfferStatus);

// ==================== DEAL MANAGEMENT ====================
router.get('/deals', adminController.getAllDeals);
router.get('/deals/:id', adminController.getDeal);
router.post('/deals', adminController.createDeal);
router.patch('/deals/:id', adminController.updateDeal);
router.delete('/deals/:id', adminController.deleteDeal);
router.patch('/deals/:id/toggle', adminController.toggleDealStatus);

// ==================== UNIVERSITY MANAGEMENT ====================
router.get('/universities', adminController.getAllUniversities);
router.get('/universities/:id', adminController.getUniversity);
router.post('/universities', adminController.createUniversity);
router.patch('/universities/:id', adminController.updateUniversity);
router.delete('/universities/:id', adminController.deleteUniversity);
router.patch('/universities/:id/featured', adminController.toggleUniversityFeatured);

// ==================== STUDY ABROAD APPLICATION WORKFLOW MANAGEMENT ====================
router.get('/applications', validateQuery(paginationSchema), adminController.getAllApplications);
router.get('/applications/:id', adminController.getApplication);
router.patch('/applications/:id/status', adminController.updateApplicationStatus);
router.patch('/applications/:id/documents/:documentType', adminController.verifyApplicationDocument);
router.post('/applications/:id/communications', adminController.addApplicationCommunication);
router.patch('/applications/:id/assign', adminController.assignApplication);
router.post('/applications/:id/notes', adminController.addApplicationNote);
router.delete('/applications/:id', adminController.deleteApplication);

// ==================== STUDY ABROAD PROGRAM MANAGEMENT ====================
router.get('/programs', validateQuery(paginationSchema), adminController.getAllPrograms);
router.get('/programs/:id', adminController.getProgram);
router.post('/programs', adminController.createProgram);
router.patch('/programs/:id', adminController.updateProgram);
router.delete('/programs/:id', adminController.deleteProgram);

// ==================== VISA APPLICATION MANAGEMENT ====================
router.get('/visa-applications', validateQuery(paginationSchema), adminController.getAllVisaApplications);
router.get('/visa-applications/:id', adminController.getVisaApplication);
router.patch('/visa-applications/:id/status', adminController.updateVisaApplicationStatus);
router.post('/visa-applications/:id/notes', adminController.addVisaApplicationNote);
router.delete('/visa-applications/:id', adminController.deleteVisaApplication);

// ==================== HOTEL BOOKING MANAGEMENT ====================
router.get('/hotel-bookings', validateQuery(paginationSchema), adminController.getAllHotelBookings);
router.get('/hotel-bookings/:id', adminController.getHotelBooking);
router.patch('/hotel-bookings/:id/status', adminController.updateHotelBookingStatus);
router.post('/hotel-bookings/:id/notes', adminController.addHotelBookingNote);
router.delete('/hotel-bookings/:id', adminController.deleteHotelBooking);

// ==================== HOLIDAY PACKAGE BOOKING MANAGEMENT ====================
router.get('/holiday-package-bookings', validateQuery(paginationSchema), adminController.getAllHolidayPackageBookings);
router.get('/holiday-package-bookings/:id', adminController.getHolidayPackageBooking);
router.patch('/holiday-package-bookings/:id/status', adminController.updateHolidayPackageBookingStatus);
router.post('/holiday-package-bookings/:id/notes', adminController.addHolidayPackageBookingNote);
router.delete('/holiday-package-bookings/:id', adminController.deleteHolidayPackageBooking);

// ==================== EXPORT FUNCTIONALITY ====================
router.post('/export/bookings', adminController.exportBookings);
router.post('/export/users', adminController.exportUsers);
router.post('/export/applications', adminController.exportApplications);
router.post('/export/universities', adminController.exportUniversities);

export default router;
