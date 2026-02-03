// server/controllers/visaController.js
import { db } from '../config/firebase.js';
import { sendApplicationEmail } from '../services/resendEmailService.js';

/**
 * Create a new visa application
 * @route POST /api/visa-applications
 * @access Protected (requires auth)
 */
export const createVisaApplication = async (req, res, next) => {
  try {
    const applicationData = req.body;
    const userId = req.user.uid;

    // Validation
    if (!applicationData || !applicationData.personalInfo || !applicationData.travelDetails) {
      return res.status(400).json({
        success: false,
        error: 'Missing required visa application data'
      });
    }

    if (!applicationData.personalInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'Applicant email is required'
      });
    }

    // Ensure userId matches authenticated user
    const newApplication = {
      ...applicationData,
      userId: userId, // Override with authenticated user ID
      type: 'visa',
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    const applicationRef = await db.collection('visaApplications').add(newApplication);
    const applicationId = applicationRef.id;

    // Update the application with its Firestore ID
    await applicationRef.update({ id: applicationId });

    // Fetch the complete application document
    const applicationDoc = await applicationRef.get();
    const application = { id: applicationId, ...applicationDoc.data() };

    // Send confirmation email
    let emailSent = false;
    let emailError = null;

    try {
      const emailResult = await sendApplicationEmail(application, 'submitted');
      emailSent = emailResult.success;

      if (!emailResult.success) {
        emailError = emailResult.message;
        console.warn('Email failed to send:', emailResult.message);
      }
    } catch (error) {
      console.error('Error sending visa application confirmation email:', error);
      emailError = error.message;
      // Don't fail the application if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Visa application submitted successfully',
      application: application,
      emailSent: emailSent,
      emailError: emailError
    });
  } catch (error) {
    console.error('Error creating visa application:', error);
    next(error);
  }
};

/**
 * Get all visa applications for a specific user
 * @route GET /api/visa-applications/user/:userId
 * @access Protected (requires auth)
 */
export const getUserVisaApplications = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.uid;

    // Users can only access their own applications (unless admin)
    if (userId !== authenticatedUserId && !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own visa applications'
      });
    }

    // Query Firestore for user's visa applications
    const applicationsSnapshot = await db
      .collection('visaApplications')
      .where('userId', '==', userId)
      .orderBy('submittedAt', 'desc')
      .get();

    const applications = [];
    applicationsSnapshot.forEach(doc => {
      applications.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      count: applications.length,
      applications: applications
    });
  } catch (error) {
    console.error('Error fetching user visa applications:', error);

    // Handle Firestore missing index error
    if (error.code === 9 || error.message.includes('index')) {
      return res.status(500).json({
        success: false,
        error: 'Database index required. Please check server logs for the index creation link.',
        details: error.message
      });
    }

    next(error);
  }
};

/**
 * Get a single visa application by ID
 * @route GET /api/visa-applications/:id
 * @access Protected (requires auth)
 */
export const getVisaApplicationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.uid;

    // Fetch application from Firestore
    const applicationDoc = await db.collection('visaApplications').doc(id).get();

    if (!applicationDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Visa application not found'
      });
    }

    const application = { id: applicationDoc.id, ...applicationDoc.data() };

    // Users can only access their own applications (unless admin)
    if (application.userId !== authenticatedUserId && !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own visa applications'
      });
    }

    res.json({
      success: true,
      application: application
    });
  } catch (error) {
    console.error('Error fetching visa application:', error);
    next(error);
  }
};




