// server/controllers/holidayController.js
import { db } from '../config/firebase.js';
import { sendBookingEmail } from '../services/gmailEmailService.js';

/**
 * Create a new holiday package booking
 * @route POST /api/holiday-package-bookings
 * @access Protected (requires auth)
 */
export const createHolidayPackageBooking = async (req, res, next) => {
  try {
    const bookingData = req.body;
    const userId = req.user.uid;

    // Validation
    if (!bookingData || !bookingData.packageDetails || !bookingData.travelerInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required holiday package booking data'
      });
    }

    if (!bookingData.travelerInfo.email) {
      return res.status(400).json({
        success: false,
        error: 'Traveler email is required'
      });
    }

    // Ensure userId matches authenticated user
    const newBooking = {
      ...bookingData,
      userId: userId, // Override with authenticated user ID
      type: 'holiday_package',
      status: 'confirmed',
      paymentStatus: 'paid', // Assume payment is processed
      bookingDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firestore
    const bookingRef = await db.collection('holidayPackageBookings').add(newBooking);
    const bookingId = bookingRef.id;

    // Update the booking with its Firestore ID
    await bookingRef.update({ id: bookingId });

    // Fetch the complete booking document
    const bookingDoc = await bookingRef.get();
    const booking = { id: bookingId, ...bookingDoc.data() };

    // Send confirmation email
    let emailSent = false;
    let emailError = null;

    try {
      const emailResult = await sendBookingEmail(booking, 'confirmed');
      emailSent = emailResult.success;

      if (!emailResult.success) {
        emailError = emailResult.message;
        console.warn('Email failed to send:', emailResult.message);
      }
    } catch (error) {
      console.error('Error sending holiday package booking confirmation email:', error);
      emailError = error.message;
      // Don't fail the booking if email fails
    }

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Holiday package booking created successfully',
      booking: booking,
      emailSent: emailSent,
      emailError: emailError
    });
  } catch (error) {
    console.error('Error creating holiday package booking:', error);
    next(error);
  }
};

/**
 * Get all holiday package bookings for a specific user
 * @route GET /api/holiday-package-bookings/user/:userId
 * @access Protected (requires auth)
 */
export const getUserHolidayPackageBookings = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.user.uid;

    // Users can only access their own bookings (unless admin)
    if (userId !== authenticatedUserId && !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own holiday package bookings'
      });
    }

    // Query Firestore for user's holiday package bookings
    const bookingsSnapshot = await db
      .collection('holidayPackageBookings')
      .where('userId', '==', userId)
      .orderBy('bookingDate', 'desc')
      .get();

    const bookings = [];
    bookingsSnapshot.forEach(doc => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    res.json({
      success: true,
      count: bookings.length,
      bookings: bookings
    });
  } catch (error) {
    console.error('Error fetching user holiday package bookings:', error);

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
 * Get a single holiday package booking by ID
 * @route GET /api/holiday-package-bookings/:id
 * @access Protected (requires auth)
 */
export const getHolidayPackageBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const authenticatedUserId = req.user.uid;

    // Fetch booking from Firestore
    const bookingDoc = await db.collection('holidayPackageBookings').doc(id).get();

    if (!bookingDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Holiday package booking not found'
      });
    }

    const booking = { id: bookingDoc.id, ...bookingDoc.data() };

    // Users can only access their own bookings (unless admin)
    if (booking.userId !== authenticatedUserId && !req.user.admin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: You can only access your own holiday package bookings'
      });
    }

    res.json({
      success: true,
      booking: booking
    });
  } catch (error) {
    console.error('Error fetching holiday package booking:', error);
    next(error);
  }
};




