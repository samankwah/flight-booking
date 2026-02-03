// server/routes/visaRoutes.js
import express from 'express';
import * as visaController from '../controllers/visaController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { applicationLimiter } from '../middleware/rateLimiter.js';
import { validate, visaApplicationSchema } from '../middleware/validation.js';

const router = express.Router();

// All visa routes require authentication and rate limiting
router.use(requireAuth);
router.use(applicationLimiter);

/**
 * POST /api/visa-applications
 * Create a new visa application
 * Body: Complete visa application data including personal info, travel details, documents
 */
router.post('/', validate(visaApplicationSchema), visaController.createVisaApplication);

/**
 * GET /api/visa-applications/user/:userId
 * Get all visa applications for a specific user
 * Params: userId - Firebase user ID
 */
router.get('/user/:userId', visaController.getUserVisaApplications);

/**
 * GET /api/visa-applications/:id
 * Get a single visa application by ID
 * Params: id - Firestore visa application document ID
 */
router.get('/:id', visaController.getVisaApplicationById);

export default router;




