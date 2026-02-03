/**
 * Study Abroad Application Routes (TypeScript)
 */

import express, { RequestHandler } from 'express';
import * as applicationController from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { applicationLimiter } from '../middleware/rateLimiter.js';
import { validateBody } from '../middleware/zodValidation.js';
import { ApplicationSchema } from '../schemas/application.schema.js';

const router = express.Router();

// Helper to cast async handlers to RequestHandler type
const asyncHandler = (fn: any): RequestHandler => fn;

router.use(requireAuth as RequestHandler);
router.use(applicationLimiter);

router.post('/', validateBody(ApplicationSchema), asyncHandler(applicationController.createApplication));
router.get('/user/:userId', asyncHandler(applicationController.getUserApplications));
router.get('/stats', asyncHandler(applicationController.getApplicationStatistics));
router.get('/popular-universities', asyncHandler(applicationController.getPopularUniversities));
router.get('/:id', asyncHandler(applicationController.getApplicationById));
router.post('/:id/submit', asyncHandler(applicationController.submitApplication));
router.put('/:id/status', asyncHandler(applicationController.updateApplicationStatus));
router.post('/:id/assign', asyncHandler(applicationController.assignApplication));

export default router;
