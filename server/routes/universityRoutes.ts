/**
 * University Routes (TypeScript)
 */

import express, { RequestHandler } from 'express';
import * as universityController from '../controllers/universityController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/zodValidation.js';
import { UniversitySchema } from '../schemas/university.schema.js';

const router = express.Router();

// Helper to cast async handlers to RequestHandler type
const asyncHandler = (fn: any): RequestHandler => fn;

// Public routes
router.get('/', asyncHandler(universityController.getAllUniversities));
router.get('/featured', asyncHandler(universityController.getFeaturedUniversities));
router.get('/search', asyncHandler(universityController.searchUniversities));
router.get('/slug/:slug', asyncHandler(universityController.getUniversityBySlug));
router.get('/:id', asyncHandler(universityController.getUniversityById));

// Admin routes (require auth)
router.use(requireAuth as RequestHandler);
router.post('/', validateBody(UniversitySchema), asyncHandler(universityController.createUniversity));
router.put('/:id', asyncHandler(universityController.updateUniversity));
router.post('/:id/toggle-featured', asyncHandler(universityController.toggleUniversityFeatured));
router.post('/:id/toggle-active', asyncHandler(universityController.toggleUniversityActive));
router.delete('/:id', asyncHandler(universityController.deleteUniversity));
router.get('/admin/stats', asyncHandler(universityController.getUniversityStatistics));

export default router;
