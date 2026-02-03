/**
 * Application Controller (TypeScript) - Study abroad application operations
 * Migrated from JavaScript to use ApplicationService
 */

import { Request, Response, NextFunction } from 'express';
import { applicationService } from '../services/firestore/ApplicationService.js';
import { Application } from '../models/Application.js';
import { sendApplicationEmail } from '../services/resendEmailService.js';

interface AuthRequest extends Request {
  user: {
    uid: string;
    email?: string;
    admin?: boolean;
  };
}

export const createApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const applicationData = req.body;
    const userId = req.user.uid;

    const application = Application.createNew({
      ...applicationData,
      applicant: {
        ...applicationData.applicant,
        userId
      }
    });

    const savedApplication = await applicationService.create(application);

    // Send confirmation email
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const applicationWithId = {
        id: savedApplication.id,
        ...savedApplication.toFirestore(),
        type: 'study-abroad'
      };

      const emailResult = await sendApplicationEmail(applicationWithId, 'submitted') as { success: boolean; message: string };
      emailSent = emailResult.success;

      if (!emailResult.success) {
        emailError = emailResult.message;
        console.warn('Email failed to send:', emailResult.message);
      }
    } catch (error) {
      console.error('Error sending application confirmation email:', error);
      emailError = error instanceof Error ? error.message : 'Unknown error';
    }

    res.status(201).json({
      success: true,
      message: 'Study abroad application submitted successfully',
      application: savedApplication.toFirestore(),
      emailSent,
      emailError
    });
  } catch (error) {
    console.error('Error creating application:', error);
    next(error);
  }
};

export const getUserApplications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.uid;

    if (userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own applications'
      });
      return;
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const startAfter = req.query.startAfter as string | undefined;
    const status = req.query.status as any;

    const result = await applicationService.getUserApplications(userId, {
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
    console.error('Error fetching user applications:', error);
    next(error);
  }
};

export const getApplicationById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.uid;

    const application = await applicationService.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Application not found'
      });
      return;
    }

    if (application.applicant.userId !== authenticatedUserId && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own applications'
      });
      return;
    }

    res.json({
      success: true,
      application: application.toFirestore()
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    next(error);
  }
};

export const submitApplication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const application = await applicationService.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Application not found'
      });
      return;
    }

    if (application.applicant.userId !== req.user.uid && !req.user.admin) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You can only submit your own applications'
      });
      return;
    }

    const submittedApplication = await applicationService.submitApplication(id);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      application: submittedApplication.toFirestore()
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    next(error);
  }
};

export const updateApplicationStatus = async (
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
    const { status, notes, reason } = req.body;

    const application = await applicationService.findById(id);

    if (!application) {
      res.status(404).json({
        success: false,
        error: 'Application not found'
      });
      return;
    }

    let updatedApplication: Application;

    switch (status) {
      case 'accepted':
        updatedApplication = await applicationService.acceptApplication(id, notes);
        break;
      case 'rejected':
        if (!reason) {
          res.status(400).json({
            success: false,
            error: 'Rejection reason is required'
          });
          return;
        }
        updatedApplication = await applicationService.rejectApplication(id, reason);
        break;
      case 'waitlisted':
        updatedApplication = await applicationService.waitlistApplication(id, notes);
        break;
      default:
        updatedApplication = await applicationService.update(id, {
          workflow: {
            ...application.workflow,
            status,
            notes
          }
        });
    }

    res.json({
      success: true,
      message: `Application ${status} successfully`,
      application: updatedApplication.toFirestore()
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    next(error);
  }
};

export const assignApplication = async (
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
    const { adminId } = req.body;

    if (!adminId) {
      res.status(400).json({
        success: false,
        error: 'Admin ID is required'
      });
      return;
    }

    const updatedApplication = await applicationService.assignToAdmin(id, adminId);

    res.json({
      success: true,
      message: 'Application assigned successfully',
      application: updatedApplication.toFirestore()
    });
  } catch (error) {
    console.error('Error assigning application:', error);
    next(error);
  }
};

export const getApplicationStatistics = async (
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

    const stats = await applicationService.getStatistics(dateRange);

    res.json({
      success: true,
      statistics: stats
    });
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    next(error);
  }
};

export const getPopularUniversities = async (
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

    const universities = await applicationService.getPopularUniversities(limit);

    res.json({
      success: true,
      universities
    });
  } catch (error) {
    console.error('Error fetching popular universities:', error);
    next(error);
  }
};
