// server/routes/applicationRoutes.js
import express from 'express';
import {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplication
} from '../controllers/applicationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { applicationLimiter } from '../middleware/rateLimiter.js';
import { validate, applicationSchema } from '../middleware/validation.js';

const router = express.Router();

// Protected routes (require authentication and rate limiting)
router.post('/', requireAuth, applicationLimiter, validate(applicationSchema), createApplication);
router.get('/user/:userId', requireAuth, applicationLimiter, getUserApplications);
router.get('/:id', requireAuth, applicationLimiter, getApplicationById);
router.patch('/:id', requireAuth, applicationLimiter, updateApplication);

export default router;