// server/controllers/applicationController.js
import admin from 'firebase-admin';
import { db } from '../config/firebase.js';

/**
 * Create new study abroad application
 * @route POST /api/applications
 */
export const createApplication = async (req, res) => {
  try {
    const applicationData = req.body;

    // Structure the comprehensive application
    const newApplication = {
      applicant: applicationData.applicant || {},
      university: applicationData.university || {},
      program: applicationData.program || {},
      academics: applicationData.academics || {},
      documents: {
        passport: { status: 'pending', notes: '' },
        transcripts: { status: 'pending', notes: '' },
        certificates: { status: 'pending', notes: '' },
        essay: { status: 'pending', notes: '' },
        recommendations: { status: 'pending', notes: '' },
        financialProof: { status: 'pending', notes: '' }
      },
      payment: applicationData.payment || { status: 'pending' },
      workflow: {
        status: 'submitted',
        currentStep: 'document_review',
        priority: 'medium',
        assignedTo: null,
        deadline: applicationData.deadline || '',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      communications: [],
      timeline: [{
        id: Date.now().toString(),
        action: 'Application Submitted',
        description: 'Application submitted successfully',
        timestamp: new Date().toISOString(),
        performedBy: applicationData.applicant?.userId || 'system',
        metadata: {}
      }],
      analytics: {
        timeToReview: 0,
        documentsVerified: 0,
        totalDocuments: 6,
        communicationsCount: 0
      },
      createdAt: new Date().toISOString()
    };

    const docRef = await db.collection('applications').add(newApplication);

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      error: 'Failed to create application',
      message: error.message
    });
  }
};

/**
 * Get user's applications
 * @route GET /api/applications/user/:userId
 */
export const getUserApplications = async (req, res) => {
  try {
    const { userId } = req.params;

    const snapshot = await db.collection('applications')
      .where('applicant.userId', '==', userId)
      .orderBy('workflow.submittedAt', 'desc')
      .get();

    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      message: error.message
    });
  }
};

/**
 * Get single application by ID
 * @route GET /api/applications/:id
 */
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('applications').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    res.json({
      success: true,
      application: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      error: 'Failed to fetch application',
      message: error.message
    });
  }
};

/**
 * Update application
 * @route PATCH /api/applications/:id
 */
export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      'workflow.updatedAt': new Date().toISOString()
    };

    await db.collection('applications').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Application updated successfully'
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      error: 'Failed to update application',
      message: error.message
    });
  }
};