// server/controllers/notificationController.js

import { db } from '../config/firebase.js';
import webpush from 'web-push';

const subscriptionsCollection = db.collection('notification-subscriptions');

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:support@flightbooking.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
  console.log('✅ Web Push configured with VAPID keys');
} else {
  console.warn('⚠️  VAPID keys not configured - push notifications will not work');
}

/**
 * @swagger
 * /api/notifications/subscribe:
 *   post:
 *     summary: Subscribe to push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subscription:
 *                 type: object
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully subscribed
 */
export const subscribe = async (req, res) => {
  try {
    const { subscription, userId } = req.body;

    if (!subscription || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription and userId are required',
      });
    }

    // Check if subscription already exists
    const existingSubscriptions = await subscriptionsCollection
      .where('userId', '==', userId)
      .where('endpoint', '==', subscription.endpoint)
      .get();

    if (!existingSubscriptions.empty) {
      return res.status(200).json({
        success: true,
        message: 'Subscription already exists',
      });
    }

    // Store subscription in Firestore
    const subscriptionData = {
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime || null,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    const docRef = await subscriptionsCollection.add(subscriptionData);

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to notifications',
      data: {
        id: docRef.id,
      },
    });
  } catch (error) {
    console.error('[Notifications] Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to notifications',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/notifications/unsubscribe:
 *   post:
 *     summary: Unsubscribe from push notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully unsubscribed
 */
export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint is required',
      });
    }

    const subscriptions = await subscriptionsCollection
      .where('endpoint', '==', endpoint)
      .get();

    if (subscriptions.empty) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    // Delete all matching subscriptions
    const deletePromises = subscriptions.docs.map((doc) => doc.ref.delete());
    await Promise.all(deletePromises);

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from notifications',
    });
  } catch (error) {
    console.error('[Notifications] Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from notifications',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/notifications/preferences:
 *   get:
 *     summary: Get user notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved
 */
export const getPreferences = async (req, res) => {
  try {
    const userId = req.user.uid;

    const preferencesSnapshot = await db
      .collection('notification-preferences')
      .doc(userId)
      .get();

    if (!preferencesSnapshot.exists) {
      // Return default preferences
      return res.status(200).json({
        success: true,
        data: {
          priceAlerts: true,
          bookingUpdates: true,
          promotions: false,
          flightReminders: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      data: preferencesSnapshot.data(),
    });
  } catch (error) {
    console.error('[Notifications] Get preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification preferences',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/notifications/preferences:
 *   put:
 *     summary: Update user notification preferences
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               priceAlerts:
 *                 type: boolean
 *               bookingUpdates:
 *                 type: boolean
 *               promotions:
 *                 type: boolean
 *               flightReminders:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
export const updatePreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    const preferences = req.body;

    await db.collection('notification-preferences').doc(userId).set(
      {
        ...preferences,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences,
    });
  } catch (error) {
    console.error('[Notifications] Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences',
      error: error.message,
    });
  }
};

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send push notification (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               title:
 *                 type: string
 *               body:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
export const sendNotification = async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'userId, title, and body are required',
      });
    }

    // Get user's subscriptions
    const subscriptions = await subscriptionsCollection
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    if (subscriptions.empty) {
      return res.status(404).json({
        success: false,
        message: 'No active subscriptions found for user',
      });
    }

    // Prepare push notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data || {},
    });

    console.log('[Notifications] Sending notification:', {
      userId,
      title,
      subscriptionCount: subscriptions.size,
    });

    // Send push notification to all user's subscriptions
    const sendPromises = subscriptions.docs.map(async (doc) => {
      const subscriptionData = doc.data();
      const pushSubscription = {
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        console.log(`✅ Notification sent to ${subscriptionData.endpoint.substring(0, 50)}...`);
        return { success: true, endpoint: subscriptionData.endpoint };
      } catch (error) {
        console.error(`❌ Failed to send to ${subscriptionData.endpoint.substring(0, 50)}...`, error.message);

        // If subscription is no longer valid, mark it as inactive
        if (error.statusCode === 410 || error.statusCode === 404) {
          await doc.ref.update({ isActive: false });
        }

        return { success: false, endpoint: subscriptionData.endpoint, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    res.status(200).json({
      success: true,
      message: 'Notification processing completed',
      data: {
        totalSubscriptions: subscriptions.size,
        successCount,
        failureCount: subscriptions.size - successCount,
      },
    });
  } catch (error) {
    console.error('[Notifications] Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message,
    });
  }
};

/**
 * Helper: Send notification to user
 * @private
 */
const sendToUser = async (userId, title, body, data) => {
  try {
    const subscriptions = await subscriptionsCollection
      .where('userId', '==', userId)
      .where('isActive', '==', true)
      .get();

    if (subscriptions.empty) {
      console.warn(`[Notifications] No active subscriptions for user ${userId}`);
      return { success: false, message: 'No active subscriptions' };
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data: data || {},
    });

    const sendPromises = subscriptions.docs.map(async (doc) => {
      const subscriptionData = doc.data();
      const pushSubscription = {
        endpoint: subscriptionData.endpoint,
        keys: subscriptionData.keys,
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        return { success: true };
      } catch (error) {
        if (error.statusCode === 410 || error.statusCode === 404) {
          await doc.ref.update({ isActive: false });
        }
        return { success: false, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;

    return {
      success: successCount > 0,
      totalSubscriptions: subscriptions.size,
      successCount,
    };
  } catch (error) {
    console.error('[Notifications] Send to user error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send price drop notification
 */
export const sendPriceDropNotification = async (userId, flightDetails) => {
  const { from, to, oldPrice, newPrice, departureDate } = flightDetails;
  const savings = oldPrice - newPrice;
  const savingsPercent = Math.round((savings / oldPrice) * 100);

  return sendToUser(
    userId,
    '✈️ Price Drop Alert!',
    `${from} → ${to} on ${departureDate}\nWas $${oldPrice}, now $${newPrice}\nSave $${savings} (${savingsPercent}% off!)`,
    {
      type: 'price-drop',
      url: `/flights?from=${from}&to=${to}&date=${departureDate}`,
      from,
      to,
      oldPrice,
      newPrice,
      savings,
    }
  );
};

/**
 * Send booking confirmation notification
 */
export const sendBookingConfirmationNotification = async (userId, bookingDetails) => {
  const { bookingId, flightNumber, from, to, departureDate } = bookingDetails;

  return sendToUser(
    userId,
    '🎉 Booking Confirmed!',
    `Your flight ${flightNumber} from ${from} to ${to} on ${departureDate} has been confirmed!`,
    {
      type: 'booking-confirmation',
      url: `/dashboard?booking=${bookingId}`,
      bookingId,
      flightNumber,
    }
  );
};

/**
 * Send flight reminder notification
 */
export const sendFlightReminderNotification = async (userId, flightDetails) => {
  const { flightNumber, from, to, departureDate, departureTime } = flightDetails;

  return sendToUser(
    userId,
    '⏰ Flight Reminder',
    `Your flight ${flightNumber} from ${from} to ${to} departs ${departureDate} at ${departureTime}`,
    {
      type: 'flight-reminder',
      url: '/dashboard',
      flightNumber,
    }
  );
};

/**
 * Send promotional notification
 */
export const sendPromotionalNotification = async (userId, promoDetails) => {
  const { title, message, url } = promoDetails;

  return sendToUser(
    userId,
    `🎁 ${title}`,
    message,
    {
      type: 'promotion',
      url: url || '/offers',
    }
  );
};
