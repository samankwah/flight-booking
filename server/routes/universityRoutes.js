// server/routes/universityRoutes.js
import express from 'express';
import {
  getAllUniversitiesPublic,
  searchUniversities,
  getUniversityByIdPublic
} from '../controllers/universityController.js';
import { readOnlyLimiter } from '../middleware/rateLimiter.js';
import { validateQuery, paginationSchema } from '../middleware/validation.js';

const router = express.Router();

// Apply rate limiting to all routes (read-only operations)
router.use(readOnlyLimiter);

// Public routes for frontend
router.get('/', validateQuery(paginationSchema), getAllUniversitiesPublic);
router.get('/search', validateQuery(paginationSchema), searchUniversities);
router.get('/:id', getUniversityByIdPublic);

export default router;




