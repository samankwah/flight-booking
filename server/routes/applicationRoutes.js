// server/routes/applicationRoutes.js
import express from 'express';
import {
  createApplication,
  getUserApplications,
  getApplicationById,
  updateApplication
} from '../controllers/applicationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes (require authentication)
router.post('/', authenticateToken, createApplication);
router.get('/user/:userId', authenticateToken, getUserApplications);
router.get('/:id', authenticateToken, getApplicationById);
router.patch('/:id', authenticateToken, updateApplication);

export default router;