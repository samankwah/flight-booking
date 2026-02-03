/**
 * Visa Application Controller (TypeScript) - Visa application operations
 * Migrated from JavaScript to use VisaApplicationService
 */

import { Request, Response, NextFunction } from 'express';
import { visaApplicationService } from '../services/firestore/VisaApplicationService.js';
import { VisaApplication, IVisaApplication } from '../models/VisaApplication.js';
import { sendApplicationEmail } from '../services/resendEmailService.js';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user: {
    uid: string;
    email?: string;
    admin?: boolean;
  };
}

/**
 * Create a new visa application
 * @route POST /api/visa-applications
 * @access Protected (requires auth)
 */
export const createVisaApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const applicationData = req.body;
    const userId = req.user.uid;

    // Create visa application model with authenticated user ID
    const application = VisaApplication.createNew({
      ...applicationData,
      userId // Override with authenticated user ID for security
    });

    // Validate and save to Firestore
    const savedApplication = await visaApplicationService.create(application);

    // Send confirmation email
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const applicationWithId = {
        id: savedApplication.id,
        ...savedApplication.toFirestore(),
        type: 'visa'
      };

      const emailResult = await sendApplicationEmail(applicationWithId, 'submitted') as { success: boolean; message: string };
      emailSent = emailResult.success;

      if (!emailResult.success) {
        emailError = emailResult.message;
        console.warn('Email failed to send:', emailResult.message);
      }
    } catch (error) {
      console.error('Error sending visa application confirmation email:', error);
      emailError = error instanceof Error ? error.message : 'Unknown error';
      // Don't fail the application if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Visa application submitted successfully',
      application: savedApplication.toFirestore(),
      emailSent,
      emailError
    });
  } catch (error) {
    console.error('Error creating visa application:', error);
    next(error);
  }
};

/**
 * Get all visa applications for a specific user with pagination
 * @route GET /api/visa-applications/user/:userId
 * @access Protected (requires auth)
 */
export const getUserVisaApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.uid;

    // Users can only access their own applications (unless admin)
    if (userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own visa applications'
      });
      return;
    }

    // Extract pagination parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;

    // Use VisaApplicationService with cursor-based pagination
    const result = await visaApplicationService.getUserApplications(userId, {
      limit,
      startAfter: startAfter ? JSON.parse(startAfter) : undefined,
      status
    });

    res.json({
      success: true,
      count: result.data.length,
      hasMore: result.hasMore,
      applications: result.data.map(a => a.toFirestore()),
      nextCursor: result.nextCursor ? JSON.stringify(result.nextCursor) : null
    });
  } catch (error) {
    console.error('Error fetching user visa applications:', error);

    // Handle Firestore missing index error
    if ((error as any).code === 9 || (error as Error).message.includes('index')) {
      res.status(500).json({
        success: false,
        error: 'Database index required. Please check server logs for the index creation link.',
        details: (error as Error).message
      });
      return;
    }

    next(error);
  }
};

/**
 * Get a single visa application by ID
 * @route GET /api/visa-applications/:id
 * @access Protected (requires auth)
 */
export const getVisaApplicationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.uid;

    // Fetch application using VisaApplicationService
    const application = await visaApplicationService.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Visa application not found'
      });
      return;
    }

    // Users can only access their own applications (unless admin)
    if (application.userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own visa applications'
      });
      return;
    }

    res.json({
      success: true,
      application: application.toFirestore()
    });
  } catch (error) {
    console.error('Error fetching visa application:', error);
    next(error);
  }
};

/**
 * Update visa application status (admin only)
 * @route PUT /api/visa-applications/:id/status
 * @access Protected (admin only)
 */
export const updateVisaApplicationStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const { id } = req.params;
    const { status, notes, rejectionReason } = req.body;

    const application = await visaApplicationService.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Visa application not found'
      });
      return;
    }

    // Update status based on action
    let updatedApplication: VisaApplication;

    switch (status) {
      case 'approved':
        updatedApplication = await visaApplicationService.approveApplication(id, notes);
        break;
      case 'rejected':
        if (!rejectionReason) {
          res.status(400).json({
            success: false,
            error: 'Rejection reason is required'
          });
          return;
        }
        updatedApplication = await visaApplicationService.rejectApplication(id, rejectionReason);
        break;
      case 'processing':
        updatedApplication = await visaApplicationService.update(id, {
          status: 'processing',
          notes
        } as Partial<IVisaApplication>);
        break;
      default:
        updatedApplication = await visaApplicationService.update(id, { status, notes } as Partial<IVisaApplication>);
    }

    // Send status update email
    try {
      const applicationWithId = {
        id: updatedApplication.id,
        ...updatedApplication.toFirestore(),
        type: 'visa'
      };
      await sendApplicationEmail(applicationWithId, status);
    } catch (emailError) {
      console.error('Error sending status update email:', emailError);
      // Don't fail the update if email fails
    }

    res.json({
      success: true,
      message: `Visa application ${status} successfully`,
      application: updatedApplication.toFirestore()
    });
  } catch (error) {
    console.error('Error updating visa application status:', error);
    next(error);
  }
};

/**
 * Add document to visa application
 * @route POST /api/visa-applications/:id/documents
 * @access Protected
 */
export const addDocumentToApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { type, name, url } = req.body;

    if (!type || !name || !url) {
      res.status(400).json({
        success: false,
        error: 'Document type, name, and URL are required'
      });
      return;
    }

    const application = await visaApplicationService.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Visa application not found'
      });
      return;
    }

    // Users can only update their own applications (unless admin)
    if (application.userId !== req.user.uid && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only update your own applications'
      });
      return;
    }

    const document = {
      type,
      name,
      url,
      uploadedAt: new Date().toISOString()
    };

    const updatedApplication = await visaApplicationService.addDocument(id, document);

    res.json({
      success: true,
      message: 'Document added successfully',
      application: updatedApplication.toFirestore()
    });
  } catch (error) {
    console.error('Error adding document to visa application:', error);
    next(error);
  }
};

/**
 * Get visa application statistics (admin only)
 * @route GET /api/visa-applications/stats
 * @access Protected (admin only)
 */
export const getVisaStatistics = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const dateRange = startDate && endDate ? { start: startDate, end: endDate } : undefined;

    const stats = await visaApplicationService.getStatistics(dateRange);

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching visa statistics:', error);
    next(error);
  }
};

/**
 * Get popular destination countries (admin only)
 * @route GET /api/visa-applications/popular-destinations
 * @access Protected (admin only)
 */
export const getPopularDestinations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Admin access required'
      });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    const destinations = await visaApplicationService.getPopularDestinations(limit);

    res.json({
      success: true,
      destinations
    });
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    next(error);
  }
};
