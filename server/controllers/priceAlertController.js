// server/controllers/priceAlertController.js
import { db } from '../config/firebase.js';
import PriceAlert from '../models/priceAlert.js';

const alertsCollection = db.collection('priceAlerts');

/**
 * Create a new price alert
 */
export const createPriceAlert = async (req, res) => {
  try {
    const userId = req.user.uid; // From auth middleware
    const alertData = {
      userId,
      email: req.user.email,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const priceAlert = new PriceAlert(alertData);
    const docRef = await alertsCollection.add(priceAlert.toFirestore());

    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...priceAlert.toFirestore(),
      },
      message: 'Price alert created successfully',
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create price alert',
      message: error.message,
    });
  }
};

/**
 * Get all price alerts for a user
 */
export const getUserPriceAlerts = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { active } = req.query;

    let query = alertsCollection.where('userId', '==', userId);

    if (active !== undefined) {
      query = query.where('active', '==', active === 'true');
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    const alerts = [];
    snapshot.forEach((doc) => {
      alerts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.json({
      success: true,
      data: alerts,
      count: alerts.length,
    });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price alerts',
      message: error.message,
    });
  }
};

/**
 * Get a specific price alert
 */
export const getPriceAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const doc = await alertsCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Price alert not found',
      });
    }

    const alertData = doc.data();

    // Verify ownership
    if (alertData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this alert',
      });
    }

    res.json({
      success: true,
      data: {
        id: doc.id,
        ...alertData,
      },
    });
  } catch (error) {
    console.error('Error fetching price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price alert',
      message: error.message,
    });
  }
};

/**
 * Update a price alert
 */
export const updatePriceAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const updates = req.body;

    const doc = await alertsCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Price alert not found',
      });
    }

    const alertData = doc.data();

    // Verify ownership
    if (alertData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this alert',
      });
    }

    // Update the alert
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await alertsCollection.doc(id).update(updatedData);

    res.json({
      success: true,
      data: {
        id,
        ...alertData,
        ...updatedData,
      },
      message: 'Price alert updated successfully',
    });
  } catch (error) {
    console.error('Error updating price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update price alert',
      message: error.message,
    });
  }
};

/**
 * Delete a price alert
 */
export const deletePriceAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const doc = await alertsCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Price alert not found',
      });
    }

    const alertData = doc.data();

    // Verify ownership
    if (alertData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this alert',
      });
    }

    await alertsCollection.doc(id).delete();

    res.json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete price alert',
      message: error.message,
    });
  }
};

/**
 * Toggle alert active status
 */
export const togglePriceAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const doc = await alertsCollection.doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Price alert not found',
      });
    }

    const alertData = doc.data();

    // Verify ownership
    if (alertData.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this alert',
      });
    }

    const newActiveStatus = !alertData.active;

    await alertsCollection.doc(id).update({
      active: newActiveStatus,
      updatedAt: new Date().toISOString(),
    });

    res.json({
      success: true,
      data: {
        id,
        active: newActiveStatus,
      },
      message: `Price alert ${newActiveStatus ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error toggling price alert:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle price alert',
      message: error.message,
    });
  }
};
