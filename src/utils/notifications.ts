// src/utils/notifications.ts

/**
 * Push Notifications Manager
 * Handles browser push notifications and Firebase Cloud Messaging
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

/**
 * Get current notification permission
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) {
    return 'denied';
  }

  return Notification.permission;
};

/**
 * Request notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) {
    console.warn('[Notifications] Not supported in this browser');
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  console.log('[Notifications] Permission:', permission);

  return permission;
};

/**
 * Show a local notification
 */
export const showNotification = async (
  title: string,
  options?: NotificationOptions
): Promise<void> => {
  if (getNotificationPermission() !== 'granted') {
    console.warn('[Notifications] Permission not granted');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [200, 100, 200],
        ...options,
      });
    } else {
      // Fallback to browser notification if no service worker
      new Notification(title, options);
    }
  } catch (error) {
    console.error('[Notifications] Error showing notification:', error);
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (
  vapidPublicKey: string
): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      console.error('[Notifications] No service worker registration found');
      return null;
    }

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('[Notifications] Already subscribed');
      return subscription;
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    console.log('[Notifications] Subscribed to push notifications');

    return subscription;
  } catch (error) {
    console.error('[Notifications] Error subscribing:', error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Notifications] Unsubscribed from push notifications');
      return true;
    }

    return false;
  } catch (error) {
    console.error('[Notifications] Error unsubscribing:', error);
    return false;
  }
};

/**
 * Get current push subscription
 */
export const getPushSubscription = async (): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return null;
    }

    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('[Notifications] Error getting subscription:', error);
    return null;
  }
};

/**
 * Send subscription to backend
 */
export const saveSubscriptionToBackend = async (
  subscription: PushSubscription,
  userId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({
        subscription,
        userId,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('[Notifications] Error saving subscription:', error);
    return false;
  }
};

/**
 * Convert VAPID public key from base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Show price drop notification
 */
export const showPriceDropNotification = async (
  from: string,
  to: string,
  oldPrice: number,
  newPrice: number
): Promise<void> => {
  const savingsPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  await showNotification('✈️ Price Drop Alert!', {
    body: `${from} → ${to}\nWas $${oldPrice}, now $${newPrice} (${savingsPercent}% off!)`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `price-drop-${from}-${to}`,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Flights',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
      },
    ],
    data: {
      url: `/flights?from=${from}&to=${to}`,
    },
  });
};

/**
 * Show booking confirmation notification
 */
export const showBookingConfirmationNotification = async (
  bookingId: string,
  flightDetails: string
): Promise<void> => {
  await showNotification('🎉 Booking Confirmed!', {
    body: `Your flight has been booked successfully!\n${flightDetails}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: `booking-${bookingId}`,
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View Booking',
      },
    ],
    data: {
      url: `/dashboard?booking=${bookingId}`,
    },
  });
};

/**
 * Setup notification handlers
 */
export const setupNotificationHandlers = (): void => {
  if (!isNotificationSupported()) {
    return;
  }

  // Listen for notification click events from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'NOTIFICATION_CLICK') {
      const { url } = event.data;

      if (url) {
        window.location.href = url;
      }
    }
  });
};

/**
 * Test notification
 */
export const testNotification = async (): Promise<void> => {
  await showNotification('Test Notification', {
    body: 'This is a test notification from Flight Booking App',
    icon: '/icons/icon-192x192.png',
  });
};

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  priceAlerts: boolean;
  bookingUpdates: boolean;
  promotions: boolean;
  flightReminders: boolean;
}

/**
 * Save notification preferences
 */
export const saveNotificationPreferences = (
  preferences: NotificationPreferences
): void => {
  localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = (): NotificationPreferences => {
  const stored = localStorage.getItem('notificationPreferences');

  if (stored) {
    return JSON.parse(stored);
  }

  // Default preferences
  return {
    priceAlerts: true,
    bookingUpdates: true,
    promotions: false,
    flightReminders: true,
  };
};

/**
 * Initialize notifications
 */
export const initNotifications = async (
  options?: {
    vapidPublicKey?: string;
    userId?: string;
    autoRequest?: boolean;
  }
): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}> => {
  const supported = isNotificationSupported();

  if (!supported) {
    return {
      supported: false,
      permission: 'denied',
      subscription: null,
    };
  }

  setupNotificationHandlers();

  let permission = getNotificationPermission();

  // Auto-request permission if enabled and permission is default
  if (options?.autoRequest && permission === 'default') {
    permission = await requestNotificationPermission();
  }

  let subscription = null;

  // Subscribe to push if permission granted and VAPID key provided
  if (permission === 'granted' && options?.vapidPublicKey) {
    subscription = await subscribeToPushNotifications(options.vapidPublicKey);

    // Save subscription to backend if userId provided
    if (subscription && options?.userId) {
      await saveSubscriptionToBackend(subscription, options.userId);
    }
  }

  return {
    supported,
    permission,
    subscription,
  };
};
