// server/controllers/adminController.js
import { db, setAdminClaim, disableUser, getUserDetails, listAllUsers } from '../utils/firebaseAdmin.js';
import admin from 'firebase-admin';
import { sendBookingEmail } from '../services/gmailEmailService.js';
import { sendApplicationEmail } from '../services/resendEmailService.js';

// ==================== BOOKING MANAGEMENT ====================

/**
 * Get all bookings with optional filters
 * @route GET /api/admin/bookings
 */
export const getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let query = db.collection('bookings').orderBy('bookingDate', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (startDate) {
      query = query.where('bookingDate', '>=', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.where('bookingDate', '<=', new Date(endDate).toISOString());
    }

    // Pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    query = query.limit(limitNum).offset(offsetNum);

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      bookings,
      total: snapshot.size,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch bookings',
      message: error.message
    });
  }
};

/**
 * Get single booking by ID
 * @route GET /api/admin/bookings/:id
 */
export const getBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('bookings').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      error: 'Failed to fetch booking',
      message: error.message
    });
  }
};

/**
 * Update booking
 * @route PATCH /api/admin/bookings/:id
 */
export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    };

    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    await db.collection('bookings').doc(id).update(updateData);

    // Send email notification if status changed
    if (status) {
      const booking = await db.collection('bookings').doc(id).get();
      await sendBookingEmail(booking.data(), status);
    }

    res.json({
      success: true,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({
      error: 'Failed to update booking',
      message: error.message
    });
  }
};

/**
 * Delete booking
 * @route DELETE /api/admin/bookings/:id
 */
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('bookings').doc(id).delete();

    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      error: 'Failed to delete booking',
      message: error.message
    });
  }
};

/**
 * Refund booking
 * @route POST /api/admin/bookings/:id/refund
 */
export const refundBooking = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection('bookings').doc(id).update({
      status: 'refunded',
      paymentStatus: 'refunded',
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),
      refundedBy: req.user.uid
    });

    // Send refund email
    const booking = await db.collection('bookings').doc(id).get();
    await sendBookingEmail(booking.data(), 'refunded');

    res.json({
      success: true,
      message: 'Booking refunded successfully'
    });
  } catch (error) {
    console.error('Refund booking error:', error);
    res.status(500).json({
      error: 'Failed to refund booking',
      message: error.message
    });
  }
};

/**
 * Add admin note to booking
 * @route POST /api/admin/bookings/:id/notes
 */
export const addBookingNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        error: 'Note is required'
      });
    }

    await db.collection('bookings').doc(id).update({
      adminNotes: note,
      noteAddedAt: admin.firestore.FieldValue.serverTimestamp(),
      noteAddedBy: req.user.uid
    });

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add booking note error:', error);
    res.status(500).json({
      error: 'Failed to add note',
      message: error.message
    });
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const { maxResults = 1000, pageToken } = req.query;

    const result = await listAllUsers(parseInt(maxResults), pageToken);

    res.json({
      success: true,
      users: result.users,
      pageToken: result.pageToken
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error.message
    });
  }
};

/**
 * Get single user by ID
 * @route GET /api/admin/users/:id
 */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userDetails = await getUserDetails(id);

    res.json({
      success: true,
      user: userDetails
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user',
      message: error.message
    });
  }
};

/**
 * Set admin status for user
 * @route PATCH /api/admin/users/:id/admin
 */
export const setAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAdmin } = req.body;

    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({
        error: 'isAdmin must be a boolean value'
      });
    }

    await setAdminClaim(id, isAdmin);

    res.json({
      success: true,
      message: `User admin status updated to: ${isAdmin}`
    });
  } catch (error) {
    console.error('Set admin status error:', error);
    res.status(500).json({
      error: 'Failed to update admin status',
      message: error.message
    });
  }
};

/**
 * Disable or enable user account
 * @route PATCH /api/admin/users/:id/disable
 */
export const disableUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { disabled } = req.body;

    if (typeof disabled !== 'boolean') {
      return res.status(400).json({
        error: 'disabled must be a boolean value'
      });
    }

    await disableUser(id, disabled);

    res.json({
      success: true,
      message: `User account ${disabled ? 'disabled' : 'enabled'}`
    });
  } catch (error) {
    console.error('Disable user error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: error.message
    });
  }
};

/**
 * Get user's bookings
 * @route GET /api/admin/users/:id/bookings
 */
export const getUserBookings = async (req, res) => {
  try {
    const { id } = req.params;

    const snapshot = await db.collection('bookings')
      .where('userId', '==', id)
      .orderBy('bookingDate', 'desc')
      .get();

    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      bookings,
      total: bookings.length
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch user bookings',
      message: error.message
    });
  }
};

// ==================== ANALYTICS ====================

/**
 * Get revenue statistics from all booking types
 * @route GET /api/admin/analytics/revenue
 */
export const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Fetch all paid bookings from all collections in parallel
    const [
      flightBookingsSnapshot,
      hotelBookingsSnapshot,
      holidayPackageBookingsSnapshot
    ] = await Promise.all([
      db.collection('bookings').where('paymentStatus', '==', 'paid').get(),
      db.collection('hotelBookings').where('paymentStatus', '==', 'paid').get(),
      db.collection('holidayPackageBookings').where('paymentStatus', '==', 'paid').get()
    ]);

    let totalRevenue = 0;
    const revenueByDate = {};
    const revenueByCurrency = {};
    let filteredCount = 0;

    // Filter by date range in memory
    const startDateTime = startDate ? new Date(startDate).getTime() : null;
    const endDateTime = endDate ? new Date(endDate).getTime() : null;

    // Process flight bookings
    flightBookingsSnapshot.forEach(doc => {
      const data = doc.data();
      processBookingData(data, 'bookingDate');
    });

    // Process hotel bookings
    hotelBookingsSnapshot.forEach(doc => {
      const data = doc.data();
      processBookingData(data, 'bookingDate');
    });

    // Process holiday package bookings
    holidayPackageBookingsSnapshot.forEach(doc => {
      const data = doc.data();
      processBookingData(data, 'bookingDate');
    });

    function processBookingData(data, dateField) {
      // Apply date filtering in memory
      if (data[dateField]) {
        const bookingTime = new Date(data[dateField]).getTime();

        if (startDateTime && bookingTime < startDateTime) {
          return; // Skip this booking
        }
        if (endDateTime && bookingTime > endDateTime) {
          return; // Skip this booking
        }
      }

      filteredCount++;
      const price = data.totalPrice || 0;
      const currency = data.currency || 'USD';

      totalRevenue += price;

      // Group by date
      const date = data[dateField] ? data[dateField].split('T')[0] : 'unknown';
      revenueByDate[date] = (revenueByDate[date] || 0) + price;

      // Group by currency
      revenueByCurrency[currency] = (revenueByCurrency[currency] || 0) + price;
    }

    res.json({
      success: true,
      totalRevenue,
      bookingCount: filteredCount,
      averageBookingValue: filteredCount > 0 ? totalRevenue / filteredCount : 0,
      revenueByDate,
      revenueByCurrency
    });
  } catch (error) {
    console.error('Revenue stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue statistics',
      message: error.message
    });
  }
};

/**
 * Get booking trends from all booking types
 * @route GET /api/admin/analytics/bookings
 */
export const getBookingTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    const cutoffTime = cutoffDate.getTime();

    // Fetch all bookings from all collections in parallel
    const [
      flightBookingsSnapshot,
      visaApplicationsSnapshot,
      hotelBookingsSnapshot,
      holidayPackageBookingsSnapshot
    ] = await Promise.all([
      db.collection('bookings').get(),
      db.collection('visaApplications').get(),
      db.collection('hotelBookings').get(),
      db.collection('holidayPackageBookings').get()
    ]);

    const bookingsByDate = {};
    const bookingsByStatus = {};
    let filteredCount = 0;

    // Process flight bookings
    flightBookingsSnapshot.forEach(doc => {
      const data = doc.data();
      processBookingTrends(data, 'bookingDate', 'status');
    });

    // Process visa applications
    visaApplicationsSnapshot.forEach(doc => {
      const data = doc.data();
      processBookingTrends(data, 'submittedAt', 'status');
    });

    // Process hotel bookings
    hotelBookingsSnapshot.forEach(doc => {
      const data = doc.data();
      processBookingTrends(data, 'bookingDate', 'status');
    });

    // Process holiday package bookings
    holidayPackageBookingsSnapshot.forEach(doc => {
      const data = doc.data();
      processBookingTrends(data, 'bookingDate', 'status');
    });

    function processBookingTrends(data, dateField, statusField) {
      // Filter by date in memory
      if (data[dateField]) {
        const bookingTime = new Date(data[dateField]).getTime();
        if (bookingTime < cutoffTime) {
          return; // Skip bookings older than cutoff
        }
      }

      filteredCount++;
      const date = data[dateField] ? data[dateField].split('T')[0] : 'unknown';
      const status = data[statusField] || 'unknown';

      bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
      bookingsByStatus[status] = (bookingsByStatus[status] || 0) + 1;
    }

    res.json({
      success: true,
      totalBookings: filteredCount,
      bookingsByDate,
      bookingsByStatus
    });
  } catch (error) {
    console.error('Booking trends error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking trends',
      message: error.message
    });
  }
};

/**
 * Get popular routes
 * @route GET /api/admin/analytics/routes
 */
export const getPopularRoutes = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const snapshot = await db.collection('bookings').get();

    const routeStats = {};

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.flightDetails) {
        const route = `${data.flightDetails.departureAirport} → ${data.flightDetails.arrivalAirport}`;
        const price = data.totalPrice || 0;

        if (!routeStats[route]) {
          routeStats[route] = { bookings: 0, revenue: 0 };
        }
        routeStats[route].bookings += 1;
        routeStats[route].revenue += price;
      }
    });

    // Sort by popularity
    const popularRoutes = Object.entries(routeStats)
      .map(([route, stats]) => ({
        route,
        bookings: stats.bookings,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, parseInt(limit)); // Top N routes

    res.json({
      success: true,
      routes: popularRoutes
    });
  } catch (error) {
    console.error('Popular routes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch popular routes',
      message: error.message
    });
  }
};

/**
 * Get dashboard statistics (summary) - aggregates all booking types
 * @route GET /api/admin/analytics/dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts from all booking collections in parallel
    const [
      flightBookingsSnapshot,
      visaApplicationsSnapshot,
      hotelBookingsSnapshot,
      holidayPackageBookingsSnapshot,
      usersResult
    ] = await Promise.all([
      db.collection('bookings').get(), // Flight bookings
      db.collection('visaApplications').get(),
      db.collection('hotelBookings').get(),
      db.collection('holidayPackageBookings').get(),
      listAllUsers(1000)
    ]);

    const flightBookings = flightBookingsSnapshot.docs.map(doc => doc.data());
    const visaApplications = visaApplicationsSnapshot.docs.map(doc => doc.data());
    const hotelBookings = hotelBookingsSnapshot.docs.map(doc => doc.data());
    const holidayPackageBookings = holidayPackageBookingsSnapshot.docs.map(doc => doc.data());

    // Calculate combined stats
    const totalBookings =
      flightBookings.length +
      visaApplications.length +
      hotelBookings.length +
      holidayPackageBookings.length;

    // Calculate total revenue from paid bookings (flight bookings and holiday packages have payment status)
    const totalRevenue =
      flightBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0) +
      hotelBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0) +
      holidayPackageBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    const activeUsers = usersResult.users.filter(u => !u.disabled).length;

    // Calculate pending bookings/applications across all types
    const pendingBookings =
      flightBookings.filter(b => b.status === 'pending').length +
      visaApplications.filter(a => a.status === 'submitted' || a.status === 'under_review').length +
      hotelBookings.filter(b => b.status === 'confirmed').length +
      holidayPackageBookings.filter(b => b.status === 'confirmed').length;

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        activeUsers,
        pendingBookings
      },
      breakdown: {
        flightBookings: flightBookings.length,
        visaApplications: visaApplications.length,
        hotelBookings: hotelBookings.length,
        holidayPackageBookings: holidayPackageBookings.length
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
};

// ==================== OFFER MANAGEMENT ====================

/**
 * Get all special offers
 * @route GET /api/admin/offers
 */
export const getAllOffers = async (req, res) => {
  try {
    const { isActive } = req.query;

    let query = db.collection('specialOffers');

    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.get();
    const offers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      offers,
      total: offers.length
    });
  } catch (error) {
    console.error('Get offers error:', error);
    res.status(500).json({
      error: 'Failed to fetch offers',
      message: error.message
    });
  }
};

/**
 * Get single offer by ID
 * @route GET /api/admin/offers/:id
 */
export const getOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('specialOffers').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Offer not found'
      });
    }

    res.json({
      success: true,
      offer: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get offer error:', error);
    res.status(500).json({
      error: 'Failed to fetch offer',
      message: error.message
    });
  }
};

/**
 * Create new offer
 * @route POST /api/admin/offers
 */
export const createOffer = async (req, res) => {
  try {
    const offerData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection('specialOffers').add(offerData);

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Create offer error:', error);
    res.status(500).json({
      error: 'Failed to create offer',
      message: error.message
    });
  }
};

/**
 * Update offer
 * @route PATCH /api/admin/offers/:id
 */
export const updateOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    };

    await db.collection('specialOffers').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Offer updated successfully'
    });
  } catch (error) {
    console.error('Update offer error:', error);
    res.status(500).json({
      error: 'Failed to update offer',
      message: error.message
    });
  }
};

/**
 * Delete offer
 * @route DELETE /api/admin/offers/:id
 */
export const deleteOffer = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('specialOffers').doc(id).delete();

    res.json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Delete offer error:', error);
    res.status(500).json({
      error: 'Failed to delete offer',
      message: error.message
    });
  }
};

/**
 * Toggle offer active status
 * @route PATCH /api/admin/offers/:id/toggle
 */
export const toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await db.collection('specialOffers').doc(id).update({
      isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    });

    res.json({
      success: true,
      message: `Offer ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle offer status error:', error);
    res.status(500).json({
      error: 'Failed to toggle offer status',
      message: error.message
    });
  }
};

// ==================== DEAL MANAGEMENT ====================

/**
 * Get all top deals
 * @route GET /api/admin/deals
 */
export const getAllDeals = async (req, res) => {
  try {
    const { category, isActive } = req.query;

    let query = db.collection('topDeals');

    if (category) {
      query = query.where('category', '==', category);
    }
    if (isActive !== undefined) {
      query = query.where('isActive', '==', isActive === 'true');
    }

    const snapshot = await query.get();
    const deals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      deals,
      total: deals.length
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({
      error: 'Failed to fetch deals',
      message: error.message
    });
  }
};

/**
 * Get single deal by ID
 * @route GET /api/admin/deals/:id
 */
export const getDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('topDeals').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Deal not found'
      });
    }

    res.json({
      success: true,
      deal: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({
      error: 'Failed to fetch deal',
      message: error.message
    });
  }
};

/**
 * Create new deal
 * @route POST /api/admin/deals
 */
export const createDeal = async (req, res) => {
  try {
    const dealData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection('topDeals').add(dealData);

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({
      error: 'Failed to create deal',
      message: error.message
    });
  }
};

/**
 * Update deal
 * @route PATCH /api/admin/deals/:id
 */
export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    };

    await db.collection('topDeals').doc(id).update(updateData);

    res.json({
      success: true,
      message: 'Deal updated successfully'
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({
      error: 'Failed to update deal',
      message: error.message
    });
  }
};

/**
 * Delete deal
 * @route DELETE /api/admin/deals/:id
 */
export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('topDeals').doc(id).delete();

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({
      error: 'Failed to delete deal',
      message: error.message
    });
  }
};

/**
 * Toggle deal active status
 * @route PATCH /api/admin/deals/:id/toggle
 */
export const toggleDealStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    await db.collection('topDeals').doc(id).update({
      isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    });

    res.json({
      success: true,
      message: `Deal ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle deal status error:', error);
    res.status(500).json({
      error: 'Failed to toggle deal status',
      message: error.message
    });
  }
};

// ==================== UNIVERSITY MANAGEMENT ====================

/**
 * Get all universities with comprehensive profiles
 * @route GET /api/admin/universities
 */
export const getAllUniversities = async (req, res) => {
  try {
    const { country, status, partnership, limit = 50, offset = 0 } = req.query;

    // Temporarily fetch all universities to avoid index requirements
    // TODO: Create proper Firestore indexes for production
    const query = db.collection('universities');

    // Store filters for in-memory processing
    let statusFilter = status;
    let partnershipFilter = partnership;
    let countryFilter = country;

    const snapshot = await query.get();
    let universities = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Extract summary information for list view
        basicInfo: data.basicInfo || {},
        academics: {
          ranking: data.academics?.ranking || {},
          totalStudents: data.academics?.totalStudents || 0
        },
        partnerships: data.partnerships || { isPartnered: false },
        settings: data.settings || { isActive: true, isFeatured: false },
        programs: data.programs || { totalPrograms: 0 },
        // Include full data for detailed view
        ...data
      };
    });

    // Apply filters in memory
    if (countryFilter) {
      universities = universities.filter(uni => uni.basicInfo?.country === countryFilter);
    }
    if (statusFilter) {
      if (statusFilter === 'active') {
        universities = universities.filter(uni => uni.settings?.isActive !== false);
      } else if (statusFilter === 'inactive') {
        universities = universities.filter(uni => uni.settings?.isActive === false);
      }
    }
    if (partnershipFilter) {
      if (partnershipFilter === 'partner') {
        universities = universities.filter(uni => uni.partnerships?.isPartnered === true);
      } else if (partnershipFilter === 'non-partner') {
        universities = universities.filter(uni => uni.partnerships?.isPartnered !== true);
      }
    }

    // Sort by created date in memory (descending)
    universities.sort((a, b) => {
      const dateA = new Date(a.settings?.createdAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.settings?.createdAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Apply pagination in memory
    const startIndex = parseInt(offset);
    const endIndex = startIndex + parseInt(limit);
    const paginatedUniversities = universities.slice(startIndex, endIndex);

    res.json({
      success: true,
      universities: paginatedUniversities,
      total: universities.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get universities error:', error);
    res.status(500).json({
      error: 'Failed to fetch universities',
      message: error.message
    });
  }
};

/**
 * Get single university with full profile by ID
 * @route GET /api/admin/universities/:id
 */
export const getUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('universities').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'University not found'
      });
    }

    const data = doc.data();

    // Structure the comprehensive university profile
    const university = {
      id: doc.id,
      basicInfo: data.basicInfo || {
        name: '',
        country: '',
        city: '',
        address: '',
        website: '',
        phone: '',
        email: ''
      },
      academics: data.academics || {
        ranking: { world: 0, national: 0, source: '', year: new Date().getFullYear() },
        accreditations: [],
        totalStudents: 0,
        internationalStudents: 0,
        facultyCount: 0,
        studentFacultyRatio: ''
      },
      facilities: data.facilities || {
        campusSize: '',
        library: false,
        sportsFacilities: false,
        dormitories: false,
        diningFacilities: false,
        medicalCenter: false,
        wifiCampus: false,
        description: ''
      },
      programs: data.programs || {
        undergraduate: [],
        postgraduate: [],
        phd: [],
        totalPrograms: 0
      },
      fees: data.fees || {
        undergraduate: { min: 0, max: 0, currency: 'USD' },
        postgraduate: { min: 0, max: 0, currency: 'USD' },
        applicationFee: 0,
        currency: 'USD'
      },
      admission: data.admission || {
        requirements: [],
        englishProficiency: [],
        deadlines: { fall: '', spring: '', summer: '' },
        applicationProcess: ''
      },
      partnerships: data.partnerships || {
        isPartnered: false,
        agreementType: '',
        commissionRate: 0,
        specialBenefits: [],
        contactPerson: ''
      },
      media: data.media || {
        logo: '',
        bannerImage: '',
        gallery: [],
        virtualTour: '',
        videos: []
      },
      settings: data.settings || {
        isActive: true,
        isFeatured: false,
        featuredPriority: 0,
        tags: [],
        targetCountries: [],
        lastUpdated: new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString()
      }
    };

    res.json({
      success: true,
      university
    });
  } catch (error) {
    console.error('Get university error:', error);
    res.status(500).json({
      error: 'Failed to fetch university',
      message: error.message
    });
  }
};

/**
 * Create new university with comprehensive profile
 * @route POST /api/admin/universities
 */
export const createUniversity = async (req, res) => {
  try {
    const universityData = req.body;

    // Structure the comprehensive university profile
    const newUniversity = {
      basicInfo: universityData.basicInfo || {
        name: universityData.name || '',
        country: universityData.country || '',
        city: universityData.city || '',
        address: '',
        website: '',
        phone: '',
        email: ''
      },
      academics: universityData.academics || {
        ranking: { world: 0, national: 0, source: '', year: new Date().getFullYear() },
        accreditations: [],
        totalStudents: 0,
        internationalStudents: 0,
        facultyCount: 0,
        studentFacultyRatio: ''
      },
      facilities: universityData.facilities || {
        campusSize: '',
        library: false,
        sportsFacilities: false,
        dormitories: false,
        diningFacilities: false,
        medicalCenter: false,
        wifiCampus: false,
        description: ''
      },
      programs: universityData.programs || {
        undergraduate: [],
        postgraduate: [],
        phd: [],
        totalPrograms: 0
      },
      fees: universityData.fees || {
        undergraduate: { min: 0, max: 0, currency: 'USD' },
        postgraduate: { min: 0, max: 0, currency: 'USD' },
        applicationFee: 0,
        currency: 'USD'
      },
      admission: universityData.admission || {
        requirements: [],
        englishProficiency: [],
        deadlines: { fall: '', spring: '', summer: '' },
        applicationProcess: ''
      },
      partnerships: universityData.partnerships || {
        isPartnered: false,
        agreementType: '',
        commissionRate: 0,
        specialBenefits: [],
        contactPerson: ''
      },
      media: universityData.media || {
        logo: '',
        bannerImage: '',
        gallery: [],
        virtualTour: '',
        videos: []
      },
      settings: {
        isActive: universityData.settings?.isActive !== undefined ? universityData.settings.isActive : true,
        isFeatured: universityData.settings?.isFeatured !== undefined ? universityData.settings.isFeatured : false,
        featuredPriority: universityData.settings?.featuredPriority || 0,
        tags: universityData.settings?.tags || [],
        targetCountries: universityData.settings?.targetCountries || [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: req.user.uid
      }
    };

    const docRef = await db.collection('universities').add(newUniversity);

    res.status(201).json({
      success: true,
      message: 'University created successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Create university error:', error);
    res.status(500).json({
      error: 'Failed to create university',
      message: error.message
    });
  }
};

/**
 * Update university with comprehensive profile
 * @route PATCH /api/admin/universities/:id
 */
export const updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Add metadata to the update
    const metadataUpdate = {
      'settings.lastUpdated': new Date().toISOString(),
      'settings.updatedBy': req.user.uid
    };

    // Merge the update data with metadata
    const finalUpdateData = {
      ...updateData,
      ...metadataUpdate
    };

    await db.collection('universities').doc(id).update(finalUpdateData);

    res.json({
      success: true,
      message: 'University updated successfully'
    });
  } catch (error) {
    console.error('Update university error:', error);
    res.status(500).json({
      error: 'Failed to update university',
      message: error.message
    });
  }
};

/**
 * Delete university
 * @route DELETE /api/admin/universities/:id
 */
export const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('universities').doc(id).delete();

    res.json({
      success: true,
      message: 'University deleted successfully'
    });
  } catch (error) {
    console.error('Delete university error:', error);
    res.status(500).json({
      error: 'Failed to delete university',
      message: error.message
    });
  }
};

/**
 * Toggle university featured status
 * @route PATCH /api/admin/universities/:id/featured
 */
export const toggleUniversityFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    await db.collection('universities').doc(id).update({
      isFeatured: featured,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    });

    res.json({
      success: true,
      message: `University ${featured ? 'featured' : 'unfeatured'} successfully`
    });
  } catch (error) {
    console.error('Toggle university featured error:', error);
    res.status(500).json({
      error: 'Failed to toggle featured status',
      message: error.message
    });
  }
};

// ==================== STUDY ABROAD APPLICATION MANAGEMENT ====================




/**
 * Add admin note to application
 * @route POST /api/admin/applications/:id/notes
 */
export const addApplicationNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        error: 'Note is required'
      });
    }

    await db.collection('studyAbroadApplications').doc(id).update({
      adminNotes: note,
      noteAddedAt: admin.firestore.FieldValue.serverTimestamp(),
      noteAddedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add application note error:', error);
    res.status(500).json({
      error: 'Failed to add note',
      message: error.message
    });
  }
};

/**
 * Delete application
 * @route DELETE /api/admin/applications/:id
 */
export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('studyAbroadApplications').doc(id).delete();

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      error: 'Failed to delete application',
      message: error.message
    });
  }
};

// ==================== STUDY ABROAD PROGRAM MANAGEMENT ====================

/**
 * Get all study abroad programs with comprehensive details
 * @route GET /api/admin/programs
 */
export const getAllPrograms = async (req, res) => {
  try {
    const { universityId, degree, status, limit = 50, offset = 0 } = req.query;

    let query = db.collection('studyAbroadPrograms').orderBy('settings.createdAt', 'desc');

    if (universityId) {
      query = query.where('basicInfo.universityId', '==', universityId);
    }
    if (degree) {
      query = query.where('basicInfo.degree', '==', degree);
    }
    if (status) {
      if (status === 'active') {
        query = query.where('settings.isActive', '==', true);
      } else if (status === 'inactive') {
        query = query.where('settings.isActive', '==', false);
      }
    }

    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.get();
    const programs = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Extract summary information for list view
        basicInfo: data.basicInfo || {},
        fees: data.fees || { tuition: { amount: 0, currency: 'USD' } },
        settings: data.settings || { isActive: true, isFeatured: false },
        academics: data.academics || { credits: 0 },
        // Include full data for detailed view
        ...data
      };
    });

    res.json({
      success: true,
      programs,
      total: programs.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get programs error:', error);
    res.status(500).json({
      error: 'Failed to fetch programs',
      message: error.message
    });
  }
};

/**
 * Get single program with full comprehensive details by ID
 * @route GET /api/admin/programs/:id
 */
export const getProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('studyAbroadPrograms').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Program not found'
      });
    }

    const data = doc.data();

    // Structure the comprehensive program profile
    const program = {
      id: doc.id,
      basicInfo: data.basicInfo || {
        name: '',
        universityId: '',
        universityName: '',
        degree: 'undergraduate',
        field: '',
        subfield: '',
        duration: '',
        language: 'English',
        description: ''
      },
      academics: data.academics || {
        credits: 0,
        curriculum: { courses: [], specializations: [], learningOutcomes: [] },
        accreditation: [],
        ranking: 0
      },
      admission: data.admission || {
        requirements: { academic: [], english: [], documents: [], experience: '' },
        deadlines: { fall: '', spring: '', summer: '' },
        process: '',
        interviews: false
      },
      fees: data.fees || {
        tuition: { amount: 0, currency: 'USD', frequency: 'year' },
        scholarships: [],
        additionalFees: []
      },
      career: data.career || {
        jobProspects: [],
        averageSalary: { amount: 0, currency: 'USD', period: 'year' },
        industries: [],
        employers: []
      },
      settings: data.settings || {
        isActive: true,
        isFeatured: false,
        priority: 0,
        tags: [],
        targetStudents: [],
        lastUpdated: new Date().toISOString(),
        createdAt: data.createdAt || new Date().toISOString()
      }
    };

    res.json({
      success: true,
      program
    });
  } catch (error) {
    console.error('Get program error:', error);
    res.status(500).json({
      error: 'Failed to fetch program',
      message: error.message
    });
  }
};

/**
 * Create new program with comprehensive profile
 * @route POST /api/admin/programs
 */
export const createProgram = async (req, res) => {
  try {
    const programData = req.body;

    // Structure the comprehensive program profile
    const newProgram = {
      basicInfo: programData.basicInfo || {
        name: '',
        universityId: '',
        universityName: '',
        degree: 'undergraduate',
        field: '',
        subfield: '',
        duration: '',
        language: 'English',
        description: ''
      },
      academics: programData.academics || {
        credits: 0,
        curriculum: { courses: [], specializations: [], learningOutcomes: [] },
        accreditation: [],
        ranking: 0
      },
      admission: programData.admission || {
        requirements: { academic: [], english: [], documents: [], experience: '' },
        deadlines: { fall: '', spring: '', summer: '' },
        process: '',
        interviews: false
      },
      fees: programData.fees || {
        tuition: { amount: 0, currency: 'USD', frequency: 'year' },
        scholarships: [],
        additionalFees: []
      },
      career: programData.career || {
        jobProspects: [],
        averageSalary: { amount: 0, currency: 'USD', period: 'year' },
        industries: [],
        employers: []
      },
      settings: {
        isActive: programData.settings?.isActive !== undefined ? programData.settings.isActive : true,
        isFeatured: programData.settings?.isFeatured !== undefined ? programData.settings.isFeatured : false,
        priority: programData.settings?.priority || 0,
        tags: programData.settings?.tags || [],
        targetStudents: programData.settings?.targetStudents || [],
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: req.user.uid
      }
    };

    const docRef = await db.collection('studyAbroadPrograms').add(newProgram);

    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      id: docRef.id
    });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({
      error: 'Failed to create program',
      message: error.message
    });
  }
};

/**
 * Update program with comprehensive profile
 * @route PATCH /api/admin/programs/:id
 */
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Add metadata to the update
    const metadataUpdate = {
      'settings.lastUpdated': new Date().toISOString(),
      'settings.updatedBy': req.user.uid
    };

    // Merge the update data with metadata
    const finalUpdateData = {
      ...updateData,
      ...metadataUpdate
    };

    await db.collection('studyAbroadPrograms').doc(id).update(finalUpdateData);

    res.json({
      success: true,
      message: 'Program updated successfully'
    });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({
      error: 'Failed to update program',
      message: error.message
    });
  }
};

/**
 * Delete program
 * @route DELETE /api/admin/programs/:id
 */
export const deleteProgram = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('studyAbroadPrograms').doc(id).delete();

    res.json({
      success: true,
      message: 'Program deleted successfully'
    });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({
      error: 'Failed to delete program',
      message: error.message
    });
  }
};

// ==================== EXPORT FUNCTIONALITY ====================

/**
 * Export bookings to CSV
 * @route POST /api/admin/export/bookings
 */
export const exportBookings = async (req, res) => {
  try {
    const { format = 'csv' } = req.body;
    const snapshot = await db.collection('bookings').get();
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (format === 'csv') {
      const csv = convertToCSV(bookings);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bookings.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: bookings
      });
    }
  } catch (error) {
    console.error('Export bookings error:', error);
    res.status(500).json({
      error: 'Failed to export bookings',
      message: error.message
    });
  }
};

/**
 * Export users to CSV
 * @route POST /api/admin/export/users
 */
export const exportUsers = async (req, res) => {
  try {
    const { format = 'csv' } = req.body;
    const result = await listAllUsers(10000);
    const users = result.users;

    if (format === 'csv') {
      const csv = convertToCSV(users);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: users
      });
    }
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      error: 'Failed to export users',
      message: error.message
    });
  }
};

/**
 * Export applications to CSV
 * @route POST /api/admin/export/applications
 */
export const exportApplications = async (req, res) => {
  try {
    const { format = 'csv' } = req.body;
    const snapshot = await db.collection('studyAbroadApplications').get();
    const applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (format === 'csv') {
      const csv = convertToCSV(applications);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: applications
      });
    }
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({
      error: 'Failed to export applications',
      message: error.message
    });
  }
};

/**
 * Export universities to CSV
 * @route POST /api/admin/export/universities
 */
export const exportUniversities = async (req, res) => {
  try {
    const { format = 'csv' } = req.body;
    const snapshot = await db.collection('universities').get();
    const universities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (format === 'csv') {
      const csv = convertToCSV(universities);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=universities.csv');
      res.send(csv);
    } else {
      res.json({
        success: true,
        data: universities
      });
    }
  } catch (error) {
    console.error('Export universities error:', error);
    res.status(500).json({
      error: 'Failed to export universities',
      message: error.message
    });
  }
};

// ==================== COMPREHENSIVE APPLICATION WORKFLOW MANAGEMENT ====================

/**
 * Get applications with full workflow details
 * @route GET /api/admin/applications
 */
export const getAllApplications = async (req, res) => {
  try {
    const {
      status,
      priority,
      university,
      assigned,
      limit = 50,
      offset = 0
    } = req.query;

    let query = db.collection('applications').orderBy('workflow.submittedAt', 'desc');

    // Apply filters
    if (status) {
      query = query.where('workflow.status', '==', status);
    }
    if (priority) {
      query = query.where('workflow.priority', '==', priority);
    }
    if (university) {
      query = query.where('university.id', '==', university);
    }
    if (assigned) {
      if (assigned === 'assigned') {
        query = query.where('workflow.assignedTo', '!=', null);
      } else if (assigned === 'unassigned') {
        query = query.where('workflow.assignedTo', '==', null);
      }
    }

    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.get();
    const applications = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        // Summary data for list view
        applicantName: `${data.applicant?.firstName || ''} ${data.applicant?.lastName || ''}`.trim(),
        email: data.applicant?.email || '',
        universityName: data.university?.name || '',
        programName: data.program?.name || '',
        status: data.workflow?.status || 'submitted',
        priority: data.workflow?.priority || 'medium',
        submittedAt: data.workflow?.submittedAt || data.createdAt,
        deadline: data.workflow?.deadline,
        documentsVerified: data.analytics?.documentsVerified || 0,
        totalDocuments: data.analytics?.totalDocuments || 6,
        paymentStatus: data.payment?.status || 'pending',
        assignedTo: data.workflow?.assignedTo,
        // Full data available for detailed view
        ...data
      };
    });

    res.json({
      success: true,
      applications,
      total: applications.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      error: 'Failed to fetch applications',
      message: error.message
    });
  }
};

/**
 * Get single application with full workflow details
 * @route GET /api/admin/applications/:id
 */
export const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('applications').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    const data = doc.data();

    // Structure the comprehensive application workflow
    const application = {
      id: doc.id,
      applicant: data.applicant || {
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        nationality: '',
        passportNumber: ''
      },
      university: data.university || {
        id: '',
        name: '',
        country: '',
        applicationFee: 0,
        currency: 'USD'
      },
      program: data.program || {
        name: '',
        degree: '',
        intakePeriod: '',
        startDate: ''
      },
      academics: data.academics || {
        currentEducation: '',
        gpa: 0,
        graduationYear: 0,
        previousInstitution: '',
        englishProficiency: { test: '', score: 0, date: '' }
      },
      documents: data.documents || {
        passport: { status: 'pending', notes: '' },
        transcripts: { status: 'pending', notes: '' },
        certificates: { status: 'pending', notes: '' },
        essay: { status: 'pending', notes: '' },
        recommendations: { status: 'pending', notes: '' },
        financialProof: { status: 'pending', notes: '' }
      },
      payment: data.payment || {
        amount: 0,
        currency: 'USD',
        status: 'pending',
        transactionId: '',
        paymentDate: '',
        method: ''
      },
      workflow: data.workflow || {
        status: 'submitted',
        currentStep: 'document_review',
        priority: 'medium',
        assignedTo: null,
        deadline: '',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      communications: data.communications || [],
      timeline: data.timeline || [],
      analytics: data.analytics || {
        timeToReview: 0,
        documentsVerified: 0,
        totalDocuments: 6,
        communicationsCount: 0
      }
    };

    res.json({
      success: true,
      application
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
 * Update application status and workflow
 * @route PATCH /api/admin/applications/:id/status
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, adminId } = req.body;

    const applicationRef = db.collection('applications').doc(id);

    // Get current application data
    const doc = await applicationRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const currentData = doc.data();

    // Update workflow status
    const workflowUpdate = {
      'workflow.status': status,
      'workflow.updatedAt': new Date().toISOString()
    };

    // Add timeline entry
    const timelineEntry = {
      id: Date.now().toString(),
      action: 'Status Updated',
      description: `Application status changed to ${status}${notes ? `: ${notes}` : ''}`,
      timestamp: new Date().toISOString(),
      performedBy: adminId || req.user.uid,
      metadata: { previousStatus: currentData.workflow?.status, newStatus: status }
    };

    await applicationRef.update({
      ...workflowUpdate,
      timeline: [...(currentData.timeline || []), timelineEntry]
    });

    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      error: 'Failed to update application status',
      message: error.message
    });
  }
};

/**
 * Verify application documents
 * @route PATCH /api/admin/applications/:id/documents/:documentType
 */
export const verifyApplicationDocument = async (req, res) => {
  try {
    const { id, documentType } = req.params;
    const { status, notes, verifiedBy } = req.body;

    const applicationRef = db.collection('applications').doc(id);

    // Update document status
    const documentUpdate = {
      [`documents.${documentType}.status`]: status,
      [`documents.${documentType}.notes`]: notes,
      [`documents.${documentType}.verifiedAt`]: new Date().toISOString(),
      [`documents.${documentType}.verifiedBy`]: verifiedBy || req.user.uid
    };

    // Add timeline entry
    const doc = await applicationRef.get();
    const currentData = doc.data();

    const timelineEntry = {
      id: Date.now().toString(),
      action: 'Document Verified',
      description: `${documentType} document ${status}${notes ? `: ${notes}` : ''}`,
      timestamp: new Date().toISOString(),
      performedBy: verifiedBy || req.user.uid,
      metadata: { documentType, status }
    };

    // Update analytics
    const currentVerified = currentData.analytics?.documentsVerified || 0;
    const newVerified = status === 'verified' ? currentVerified + 1 :
                       status === 'rejected' && currentData.documents?.[documentType]?.status === 'verified' ?
                       currentVerified - 1 : currentVerified;

    await applicationRef.update({
      ...documentUpdate,
      timeline: [...(currentData.timeline || []), timelineEntry],
      'analytics.documentsVerified': newVerified,
      'workflow.updatedAt': new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Document verification updated successfully'
    });
  } catch (error) {
    console.error('Document verification error:', error);
    res.status(500).json({
      error: 'Failed to update document verification',
      message: error.message
    });
  }
};

/**
 * Add communication to application
 * @route POST /api/admin/applications/:id/communications
 */
export const addApplicationCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, direction, subject, message, sentBy } = req.body;

    const applicationRef = db.collection('applications').doc(id);

    const communication = {
      id: Date.now().toString(),
      type,
      direction,
      subject,
      message,
      timestamp: new Date().toISOString(),
      sentBy: sentBy || req.user.uid
    };

    // Add timeline entry
    const doc = await applicationRef.get();
    const currentData = doc.data();

    const timelineEntry = {
      id: communication.id,
      action: 'Communication Added',
      description: `${type} communication: ${subject}`,
      timestamp: new Date().toISOString(),
      performedBy: sentBy || req.user.uid,
      metadata: { type, subject }
    };

    // Update analytics
    const currentCount = currentData.analytics?.communicationsCount || 0;

    await applicationRef.update({
      communications: [...(currentData.communications || []), communication],
      timeline: [...(currentData.timeline || []), timelineEntry],
      'analytics.communicationsCount': currentCount + 1,
      'workflow.updatedAt': new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Communication added successfully'
    });
  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      error: 'Failed to add communication',
      message: error.message
    });
  }
};

/**
 * Assign application to admin
 * @route PATCH /api/admin/applications/:id/assign
 */
export const assignApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, assignedBy } = req.body;

    const applicationRef = db.collection('applications').doc(id);

    // Add timeline entry
    const doc = await applicationRef.get();
    const currentData = doc.data();

    const timelineEntry = {
      id: Date.now().toString(),
      action: 'Application Assigned',
      description: `Application assigned to ${assignedTo}`,
      timestamp: new Date().toISOString(),
      performedBy: assignedBy || req.user.uid,
      metadata: { assignedTo }
    };

    await applicationRef.update({
      'workflow.assignedTo': assignedTo,
      'workflow.updatedAt': new Date().toISOString(),
      timeline: [...(currentData.timeline || []), timelineEntry]
    });

    res.json({
      success: true,
      message: 'Application assigned successfully'
    });
  } catch (error) {
    console.error('Assign application error:', error);
    res.status(500).json({
      error: 'Failed to assign application',
      message: error.message
    });
  }
};

// ==================== VISA APPLICATION MANAGEMENT ====================

/**
 * Get all visa applications with optional filters
 * @route GET /api/admin/visa-applications
 */
export const getAllVisaApplications = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let query = db.collection('visaApplications').orderBy('submittedAt', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (startDate) {
      query = query.where('submittedAt', '>=', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.where('submittedAt', '<=', new Date(endDate).toISOString());
    }

    // Pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    query = query.limit(limitNum).offset(offsetNum);

    const snapshot = await query.get();
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      applications,
      total: snapshot.size,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get visa applications error:', error);
    res.status(500).json({
      error: 'Failed to fetch visa applications',
      message: error.message
    });
  }
};

/**
 * Get single visa application by ID
 * @route GET /api/admin/visa-applications/:id
 */
export const getVisaApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('visaApplications').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Visa application not found'
      });
    }

    res.json({
      success: true,
      application: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get visa application error:', error);
    res.status(500).json({
      error: 'Failed to fetch visa application',
      message: error.message
    });
  }
};

/**
 * Update visa application status
 * @route PATCH /api/admin/visa-applications/:id/status
 */
export const updateVisaApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['submitted', 'under_review', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status value'
      });
    }

    await db.collection('visaApplications').doc(id).update({
      status,
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send email notification to applicant
    const application = await db.collection('visaApplications').doc(id).get();
    await sendApplicationEmail(application.data(), status);

    res.json({
      success: true,
      message: 'Visa application status updated successfully'
    });
  } catch (error) {
    console.error('Update visa application status error:', error);
    res.status(500).json({
      error: 'Failed to update visa application status',
      message: error.message
    });
  }
};

/**
 * Add admin note to visa application
 * @route POST /api/admin/visa-applications/:id/notes
 */
export const addVisaApplicationNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        error: 'Note is required'
      });
    }

    await db.collection('visaApplications').doc(id).update({
      adminNotes: note,
      noteAddedAt: admin.firestore.FieldValue.serverTimestamp(),
      noteAddedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add visa application note error:', error);
    res.status(500).json({
      error: 'Failed to add note',
      message: error.message
    });
  }
};

/**
 * Delete visa application
 * @route DELETE /api/admin/visa-applications/:id
 */
export const deleteVisaApplication = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('visaApplications').doc(id).delete();

    res.json({
      success: true,
      message: 'Visa application deleted successfully'
    });
  } catch (error) {
    console.error('Delete visa application error:', error);
    res.status(500).json({
      error: 'Failed to delete visa application',
      message: error.message
    });
  }
};

// ==================== HOTEL BOOKING MANAGEMENT ====================

/**
 * Get all hotel bookings with optional filters
 * @route GET /api/admin/hotel-bookings
 */
export const getAllHotelBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let query = db.collection('hotelBookings').orderBy('bookingDate', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (startDate) {
      query = query.where('bookingDate', '>=', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.where('bookingDate', '<=', new Date(endDate).toISOString());
    }

    // Pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    query = query.limit(limitNum).offset(offsetNum);

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      bookings,
      total: snapshot.size,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get hotel bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch hotel bookings',
      message: error.message
    });
  }
};

/**
 * Get single hotel booking by ID
 * @route GET /api/admin/hotel-bookings/:id
 */
export const getHotelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('hotelBookings').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Hotel booking not found'
      });
    }

    res.json({
      success: true,
      booking: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get hotel booking error:', error);
    res.status(500).json({
      error: 'Failed to fetch hotel booking',
      message: error.message
    });
  }
};

/**
 * Update hotel booking status
 * @route PATCH /api/admin/hotel-bookings/:id/status
 */
export const updateHotelBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'checked_in', 'checked_out', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status value'
      });
    }

    await db.collection('hotelBookings').doc(id).update({
      status,
      updatedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send email notification if status changed
    if (status) {
      const booking = await db.collection('hotelBookings').doc(id).get();
      await sendBookingEmail(booking.data(), status);
    }

    res.json({
      success: true,
      message: 'Hotel booking status updated successfully'
    });
  } catch (error) {
    console.error('Update hotel booking status error:', error);
    res.status(500).json({
      error: 'Failed to update hotel booking status',
      message: error.message
    });
  }
};

/**
 * Add admin note to hotel booking
 * @route POST /api/admin/hotel-bookings/:id/notes
 */
export const addHotelBookingNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        error: 'Note is required'
      });
    }

    await db.collection('hotelBookings').doc(id).update({
      adminNotes: note,
      noteAddedAt: admin.firestore.FieldValue.serverTimestamp(),
      noteAddedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add hotel booking note error:', error);
    res.status(500).json({
      error: 'Failed to add note',
      message: error.message
    });
  }
};

/**
 * Delete hotel booking
 * @route DELETE /api/admin/hotel-bookings/:id
 */
export const deleteHotelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('hotelBookings').doc(id).delete();

    res.json({
      success: true,
      message: 'Hotel booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel booking error:', error);
    res.status(500).json({
      error: 'Failed to delete hotel booking',
      message: error.message
    });
  }
};

// ==================== HOLIDAY PACKAGE BOOKING MANAGEMENT ====================

/**
 * Get all holiday package bookings with optional filters
 * @route GET /api/admin/holiday-package-bookings
 */
export const getAllHolidayPackageBookings = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

    let query = db.collection('holidayPackageBookings').orderBy('bookingDate', 'desc');

    // Apply filters
    if (status) {
      query = query.where('status', '==', status);
    }
    if (startDate) {
      query = query.where('bookingDate', '>=', new Date(startDate).toISOString());
    }
    if (endDate) {
      query = query.where('bookingDate', '<=', new Date(endDate).toISOString());
    }

    // Pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    query = query.limit(limitNum).offset(offsetNum);

    const snapshot = await query.get();
    const bookings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      bookings,
      total: snapshot.size,
      limit: limitNum,
      offset: offsetNum
    });
  } catch (error) {
    console.error('Get holiday package bookings error:', error);
    res.status(500).json({
      error: 'Failed to fetch holiday package bookings',
      message: error.message
    });
  }
};

/**
 * Get single holiday package booking by ID
 * @route GET /api/admin/holiday-package-bookings/:id
 */
export const getHolidayPackageBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('holidayPackageBookings').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        error: 'Holiday package booking not found'
      });
    }

    res.json({
      success: true,
      booking: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('Get holiday package booking error:', error);
    res.status(500).json({
      error: 'Failed to fetch holiday package booking',
      message: error.message
    });
  }
};

/**
 * Update holiday package booking status
 * @route PATCH /api/admin/holiday-package-bookings/:id/status
 */
export const updateHolidayPackageBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status value'
      });
    }

    await db.collection('holidayPackageBookings').doc(id).update({
      status,
      updatedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send email notification if status changed
    if (status) {
      const booking = await db.collection('holidayPackageBookings').doc(id).get();
      await sendBookingEmail(booking.data(), status);
    }

    res.json({
      success: true,
      message: 'Holiday package booking status updated successfully'
    });
  } catch (error) {
    console.error('Update holiday package booking status error:', error);
    res.status(500).json({
      error: 'Failed to update holiday package booking status',
      message: error.message
    });
  }
};

/**
 * Add admin note to holiday package booking
 * @route POST /api/admin/holiday-package-bookings/:id/notes
 */
export const addHolidayPackageBookingNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({
        error: 'Note is required'
      });
    }

    await db.collection('holidayPackageBookings').doc(id).update({
      adminNotes: note,
      noteAddedAt: admin.firestore.FieldValue.serverTimestamp(),
      noteAddedBy: req.user.uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Note added successfully'
    });
  } catch (error) {
    console.error('Add holiday package booking note error:', error);
    res.status(500).json({
      error: 'Failed to add note',
      message: error.message
    });
  }
};

/**
 * Delete holiday package booking
 * @route DELETE /api/admin/holiday-package-bookings/:id
 */
export const deleteHolidayPackageBooking = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('holidayPackageBookings').doc(id).delete();

    res.json({
      success: true,
      message: 'Holiday package booking deleted successfully'
    });
  } catch (error) {
    console.error('Delete holiday package booking error:', error);
    res.status(500).json({
      error: 'Failed to delete holiday package booking',
      message: error.message
    });
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects
 * @returns {string} CSV string
 */
function convertToCSV(data) {
  if (data.length === 0) return '';

  // Get headers from first object
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(','));

  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle complex objects and arrays
      if (typeof value === 'object' && value !== null) {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      }
      // Escape quotes in strings
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}
