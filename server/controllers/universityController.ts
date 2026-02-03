/**
 * University Controller (TypeScript) - University operations
 * Migrated from JavaScript to use UniversityService
 */

import { Request, Response, NextFunction } from 'express';
import { universityService } from '../services/firestore/UniversityService.js';
import { University } from '../models/University.js';

interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    admin?: boolean;
  };
}

export const getAllUniversities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const startAfter = req.query.startAfter as string | undefined;
    const country = req.query.country as string | undefined;
    const featured = req.query.featured === 'true' ? true : undefined;

    const result = await universityService.getActiveUniversities({
      limit,
      startAfter: startAfter ? JSON.parse(startAfter) : undefined,
      country,
      featured
    });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      universities: result.data.map(u => u.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Error fetching universities:', error);
    next(error);
  }
};

export const getFeaturedUniversities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const country = req.query.country as string | undefined;

    const universities = await universityService.getFeaturedUniversities({
      limit,
      country
    });

    res.json({
      success: true,
      count: universities.length,
      universities: universities.map(u => u.toFirestore())
    });
  } catch (error) {
    console.error('Error fetching featured universities:', error);
    next(error);
  }
};

export const getUniversityById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const university = await universityService.findById(id);

    if (!university) {
      res.status(404).json({
        success: false,
        error: 'University not found'
      });
      return;
    }

    res.json({
      success: true,
      university: university.toFirestore()
    });
  } catch (error) {
    console.error('Error fetching university:', error);
    next(error);
  }
};

export const getUniversityBySlug = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    const university = await universityService.getBySlug(slug);

    if (!university) {
      res.status(404).json({
        success: false,
        error: 'University not found'
      });
      return;
    }

    res.json({
      success: true,
      university: university.toFirestore()
    });
  } catch (error) {
    console.error('Error fetching university by slug:', error);
    next(error);
  }
};

export const searchUniversities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const searchTerm = req.query.q as string;

    if (!searchTerm || searchTerm.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: 'Search term must be at least 2 characters'
      });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const country = req.query.country as string | undefined;
    const activeOnly = req.query.activeOnly !== 'false';

    const universities = await universityService.searchByName(searchTerm, {
      limit,
      country,
      activeOnly
    });

    res.json({
      success: true,
      count: universities.length,
      universities: universities.map(u => u.toFirestore())
    });
  } catch (error) {
    console.error('Error searching universities:', error);
    next(error);
  }
};

export const createUniversity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const universityData = req.body;

    const university = University.createNew(universityData);

    const savedUniversity = await universityService.create(university);

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      university: savedUniversity.toFirestore()
    });
  } catch (error) {
    console.error('Error creating university:', error);
    next(error);
  }
};

export const updateUniversity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const { id } = req.params;
    const updates = req.body;

    const updatedUniversity = await universityService.update(id, updates);

    res.json({
      success: true,
      message: 'University updated successfully',
      university: updatedUniversity.toFirestore()
    });
  } catch (error) {
    console.error('Error updating university:', error);
    next(error);
  }
};

export const toggleUniversityFeatured = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const { id } = req.params;

    const updatedUniversity = await universityService.toggleFeatured(id);

    res.json({
      success: true,
      message: 'University featured status updated',
      university: updatedUniversity.toFirestore()
    });
  } catch (error) {
    console.error('Error toggling university featured status:', error);
    next(error);
  }
};

export const toggleUniversityActive = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const { id } = req.params;

    const updatedUniversity = await universityService.toggleActive(id);

    res.json({
      success: true,
      message: 'University active status updated',
      university: updatedUniversity.toFirestore()
    });
  } catch (error) {
    console.error('Error toggling university active status:', error);
    next(error);
  }
};

export const deleteUniversity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const { id } = req.params;

    await universityService.delete(id);

    res.json({
      success: true,
      message: 'University deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting university:', error);
    next(error);
  }
};

export const getUniversityStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const stats = await universityService.getStatistics();

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching university statistics:', error);
    next(error);
  }
};
