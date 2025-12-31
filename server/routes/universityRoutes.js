// server/routes/universityRoutes.js
import express from 'express';
import {
  getAllUniversitiesPublic,
  searchUniversities,
  getUniversityByIdPublic
} from '../controllers/universityController.js';

const router = express.Router();

// Public routes for frontend
router.get('/', getAllUniversitiesPublic);
router.get('/search', searchUniversities);
router.get('/:id', getUniversityByIdPublic);

export default router;
