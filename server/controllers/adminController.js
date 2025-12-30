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
 * Get revenue statistics
 * @route GET /api/admin/analytics/revenue
 */
export const getRevenueStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Fetch all paid bookings (avoid complex Firestore queries that need indexes)
    const snapshot = await db.collection('bookings')
      .where('paymentStatus', '==', 'paid')
      .get();

    let totalRevenue = 0;
    const revenueByDate = {};
    const revenueByCurrency = {};
    let filteredCount = 0;

    // Filter by date range in memory
    const startDateTime = startDate ? new Date(startDate).getTime() : null;
    const endDateTime = endDate ? new Date(endDate).getTime() : null;

    snapshot.forEach(doc => {
      const data = doc.data();

      // Apply date filtering in memory
      if (data.bookingDate) {
        const bookingTime = new Date(data.bookingDate).getTime();

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
      const date = data.bookingDate ? data.bookingDate.split('T')[0] : 'unknown';
      revenueByDate[date] = (revenueByDate[date] || 0) + price;

      // Group by currency
      revenueByCurrency[currency] = (revenueByCurrency[currency] || 0) + price;
    });

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
 * Get booking trends
 * @route GET /api/admin/analytics/bookings
 */
export const getBookingTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    const cutoffTime = cutoffDate.getTime();

    // Fetch all bookings and filter in memory (avoid complex Firestore queries)
    const snapshot = await db.collection('bookings').get();

    const bookingsByDate = {};
    const bookingsByStatus = {};
    let filteredCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();

      // Filter by date in memory
      if (data.bookingDate) {
        const bookingTime = new Date(data.bookingDate).getTime();
        if (bookingTime < cutoffTime) {
          return; // Skip bookings older than cutoff
        }
      }

      filteredCount++;
      const date = data.bookingDate ? data.bookingDate.split('T')[0] : 'unknown';
      const status = data.status || 'unknown';

      bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
      bookingsByStatus[status] = (bookingsByStatus[status] || 0) + 1;
    });

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
 * Get dashboard statistics (summary)
 * @route GET /api/admin/analytics/dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Get counts in parallel
    const [bookingsSnapshot, usersResult] = await Promise.all([
      db.collection('bookings').get(),
      listAllUsers(1000)
    ]);

    const bookings = bookingsSnapshot.docs.map(doc => doc.data());

    // Calculate stats
    const totalBookings = bookings.length;
    const totalRevenue = bookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const activeUsers = usersResult.users.filter(u => !u.disabled).length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;

    res.json({
      success: true,
      stats: {
        totalBookings,
        totalRevenue,
        activeUsers,
        pendingBookings
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
 * Get all universities
 * @route GET /api/admin/universities
 */
export const getAllUniversities = async (req, res) => {
  try {
    const { country, featured, limit = 50 } = req.query;

    let query = db.collection('universities').orderBy('ranking', 'asc');

    if (country) {
      query = query.where('country', '==', country);
    }
    if (featured !== undefined) {
      query = query.where('isFeatured', '==', featured === 'true');
    }

    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    const universities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      universities,
      total: universities.length
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
 * Get single university by ID
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

    res.json({
      success: true,
      university: { id: doc.id, ...doc.data() }
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
 * Create new university
 * @route POST /api/admin/universities
 */
export const createUniversity = async (req, res) => {
  try {
    const universityData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      isFeatured: req.body.isFeatured !== undefined ? req.body.isFeatured : false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection('universities').add(universityData);

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
 * Update university
 * @route PATCH /api/admin/universities/:id
 */
export const updateUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    };

    await db.collection('universities').doc(id).update(updateData);

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
 * Get all study abroad applications
 * @route GET /api/admin/applications
 */
export const getAllApplications = async (req, res) => {
  try {
    const { status, universityId, limit = 50, offset = 0 } = req.query;

    let query = db.collection('studyAbroadApplications').orderBy('submittedAt', 'desc');

    if (status) {
      query = query.where('status', '==', status);
    }
    if (universityId) {
      query = query.where('universityId', '==', universityId);
    }

    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.get();
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      applications,
      total: applications.length
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
 * Get single application by ID
 * @route GET /api/admin/applications/:id
 */
export const getApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('studyAbroadApplications').doc(id).get();

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
 * Update application status
 * @route PATCH /api/admin/applications/:id/status
 */
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['submitted', 'under_review', 'accepted', 'rejected', 'waitlisted'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status value'
      });
    }

    await db.collection('studyAbroadApplications').doc(id).update({
      status,
      reviewedBy: req.user.uid,
      reviewedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Send email notification to student
    const application = await db.collection('studyAbroadApplications').doc(id).get();
    await sendApplicationEmail(application.data(), status);

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
 * Get all study abroad programs
 * @route GET /api/admin/programs
 */
export const getAllPrograms = async (req, res) => {
  try {
    const { universityId, degree, limit = 50 } = req.query;

    let query = db.collection('studyAbroadPrograms');

    if (universityId) {
      query = query.where('universityId', '==', universityId);
    }
    if (degree) {
      query = query.where('degree', '==', degree);
    }

    query = query.limit(parseInt(limit));

    const snapshot = await query.get();
    const programs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      programs,
      total: programs.length
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
 * Get single program by ID
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

    res.json({
      success: true,
      program: { id: doc.id, ...doc.data() }
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
 * Create new program
 * @route POST /api/admin/programs
 */
export const createProgram = async (req, res) => {
  try {
    const programData = {
      ...req.body,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: req.user.uid
    };

    const docRef = await db.collection('studyAbroadPrograms').add(programData);

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
 * Update program
 * @route PATCH /api/admin/programs/:id
 */
export const updateProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: req.user.uid
    };

    await db.collection('studyAbroadPrograms').doc(id).update(updateData);

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
