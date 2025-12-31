// server/routes/visaRoutes.js
import express from 'express';
import * as visaController from '../controllers/visaController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// All visa routes require authentication
router.use(requireAuth);

/**
 * POST /api/visa-applications
 * Create a new visa application
 * Body: Complete visa application data including personal info, travel details, documents
 */
router.post('/', visaController.createVisaApplication);

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
