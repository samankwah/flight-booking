/**
 * Visa Application Routes (TypeScript) - Visa application endpoints
 * Migrated to use TypeScript controller and Zod validation
 */

import express, { RequestHandler } from 'express';
import * as visaController from '../controllers/visaController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { applicationLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/zodValidation.js';
import { VisaApplicationSchema } from '../schemas/visa.schema.js';

const router = express.Router();

// Helper to cast async handlers to RequestHandler type
const asyncHandler = (fn: any): RequestHandler => fn;

// All visa routes require authentication and rate limiting
router.use(requireAuth as RequestHandler);
router.use(applicationLimiter);

/**
 * POST /api/visa-applications
 * Create a new visa application
 * Body: Complete visa application data including personal info, travel details, documents
 */
router.post(
  '/',
  validateBody(VisaApplicationSchema),
  asyncHandler(visaController.createVisaApplication)
);

/**
 * GET /api/visa-applications/user/:userId
 * Get all visa applications for a specific user with pagination
 * Params: userId - Firebase user ID
 * Query: limit, startAfter, status
 */
router.get('/user/:userId', asyncHandler(visaController.getUserVisaApplications));

/**
 * GET /api/visa-applications/stats
 * Get visa application statistics (admin only)
 * Query: startDate, endDate
 */
router.get('/stats', asyncHandler(visaController.getVisaStatistics));

/**
 * GET /api/visa-applications/popular-destinations
 * Get popular destination countries (admin only)
 * Query: limit
 */
router.get('/popular-destinations', asyncHandler(visaController.getPopularDestinations));

/**
 * GET /api/visa-applications/:id
 * Get a single visa application by ID
 * Params: id - Firestore visa application document ID
 */
router.get('/:id', asyncHandler(visaController.getVisaApplicationById));

/**
 * PUT /api/visa-applications/:id/status
 * Update visa application status (admin only)
 * Body: { status, notes?, rejectionReason? }
 */
router.put('/:id/status', asyncHandler(visaController.updateVisaApplicationStatus));

/**
 * POST /api/visa-applications/:id/documents
 * Add document to visa application
 * Body: { type, name, url }
 */
router.post('/:id/documents', asyncHandler(visaController.addDocumentToApplication));

export default router;
