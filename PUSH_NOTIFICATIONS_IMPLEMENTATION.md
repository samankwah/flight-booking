# Push Notifications Implementation Guide

## Overview

This guide covers the complete implementation of web push notifications in the flight booking application. The system enables real-time notifications for price drops, booking confirmations, flight reminders, and promotional offers.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Setup Instructions](#setup-instructions)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Integration](#frontend-integration)
5. [Notification Types](#notification-types)
6. [Testing Guide](#testing-guide)
7. [Browser Compatibility](#browser-compatibility)
8. [Troubleshooting](#troubleshooting)
9. [Security Considerations](#security-considerations)
10. [Production Deployment](#production-deployment)

---

## Architecture Overview

### System Components

```
┌─────────────────┐
│   User Browser  │
│                 │
│  Service Worker │◄──── Push Event
│                 │
└────────┬────────┘
         │
         │ Subscribe/Unsubscribe
         │
┌────────▼────────┐
│  Frontend App   │
│                 │
│  - Request      │
│    Permission   │
│  - Subscribe    │
│  - Preferences  │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐
│  Backend API    │
│                 │
│  - Store Sub    │
│  - Send Push    │
│  - Preferences  │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   Firestore     │
│                 │
│  - Subscriptions│
│  - Preferences  │
└─────────────────┘
```

### Technology Stack

- **Backend**: Node.js, Express, web-push library
- **Frontend**: React, TypeScript, Service Workers
- **Database**: Firebase Firestore
- **Protocol**: Web Push Protocol (RFC 8030)
- **Authentication**: VAPID (Voluntary Application Server Identification)

---

## Setup Instructions

### 1. Generate VAPID Keys

VAPID keys are required for identifying your application to push services.

```bash
# Navigate to server directory
cd server

# Install web-push globally (if not already installed)
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

**Output:**
```
=======================================
Public Key:
BNxZ8y...your-public-key...xyz123

Private Key:
abcd1234...your-private-key...wxyz
=======================================
```

### 2. Configure Environment Variables

Add the generated keys to your `server/.env` file:

```env
# VAPID Configuration
VAPID_PUBLIC_KEY=BNxZ8y...your-public-key...xyz123
VAPID_PRIVATE_KEY=abcd1234...your-private-key...wxyz
VAPID_SUBJECT=mailto:support@yourdomain.com

# Or use your website URL
VAPID_SUBJECT=https://yourdomain.com
```

**Important Notes:**
- Keep the private key secret and never commit it to version control
- The subject should be a mailto: link or https:// URL identifying your application
- Store keys securely in production (use environment variables or secret managers)

### 3. Update Frontend Configuration

Add the VAPID public key to your frontend environment:

**`.env` (root directory):**
```env
VITE_VAPID_PUBLIC_KEY=BNxZ8y...your-public-key...xyz123
```

**Update `src/utils/notifications.ts`:**
```typescript
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  // ... existing code ...

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  return subscription;
};
```

### 4. Install Dependencies

```bash
# Backend
cd server
npm install web-push

# Frontend (already installed)
cd ..
# No additional packages needed - uses native Web Push API
```

---

## Backend Implementation

### Controller: `server/controllers/notificationController.js`

The notification controller handles all push notification operations:

#### VAPID Configuration

```javascript
import webpush from 'web-push';

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
```

#### Key Functions

**1. Subscribe to Notifications**

Endpoint: `POST /api/notifications/subscribe`

```javascript
export const subscribe = async (req, res) => {
  const { subscription, userId } = req.body;

  // Check for duplicate subscriptions
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
    data: { id: docRef.id },
  });
};
```

**2. Send Push Notification**

Endpoint: `POST /api/notifications/send`

```javascript
export const sendNotification = async (req, res) => {
  const { userId, title, body, data } = req.body;

  // Get user's active subscriptions
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

  // Send to all user's subscriptions
  const sendPromises = subscriptions.docs.map(async (doc) => {
    const subscriptionData = doc.data();
    const pushSubscription = {
      endpoint: subscriptionData.endpoint,
      keys: subscriptionData.keys,
    };

    try {
      await webpush.sendNotification(pushSubscription, payload);
      return { success: true, endpoint: subscriptionData.endpoint };
    } catch (error) {
      // Mark invalid subscriptions as inactive
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
};
```

**3. Notification Preferences**

Endpoints:
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences

```javascript
export const updatePreferences = async (req, res) => {
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
};
```

---

## Frontend Integration

### Service Worker: `public/sw.js`

The service worker handles incoming push notifications:

```javascript
// Listen for push events
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);

  let notificationData = {
    title: 'Flight Booking Update',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = { ...notificationData, ...payload };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const promiseChain = self.registration.showNotification(
    notificationData.title,
    {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      vibrate: [200, 100, 200],
      tag: notificationData.data.type || 'general',
      requireInteraction: false,
    }
  );

  event.waitUntil(promiseChain);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification Click:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
```

### Notification Utilities: `src/utils/notifications.ts`

```typescript
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Send subscription to backend
    const response = await fetch(`${API_BASE_URL}/api/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: await getCurrentUserId(),
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to subscribe to notifications');
    }

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

export const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    // Unsubscribe from backend
    await fetch(`${API_BASE_URL}/api/notifications/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
      }),
    });

    // Unsubscribe locally
    await subscription.unsubscribe();

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
};
```

### React Components

**Notification Initializer: `src/components/NotificationInitializer.tsx`**

Automatically subscribes authenticated users to push notifications:

```typescript
export const NotificationInitializer: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const initializeNotifications = async () => {
      const permission = await requestNotificationPermission();

      if (permission === 'granted') {
        await subscribeToPushNotifications();
      }
    };

    initializeNotifications();
  }, [user]);

  return null;
};
```

**Notification Preferences: `src/components/NotificationPreferences.tsx`**

User interface for managing notification preferences:

```typescript
export const NotificationPreferences: React.FC = () => {
  const [preferences, setPreferences] = useState({
    priceAlerts: true,
    bookingUpdates: true,
    promotions: false,
    flightReminders: true,
  });

  const handleToggle = async (key: keyof typeof preferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };

    setPreferences(newPreferences);

    // Save to backend
    await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await getAuthToken()}`,
      },
      body: JSON.stringify(newPreferences),
    });
  };

  return (
    <div className="space-y-4">
      <h3>Notification Preferences</h3>

      <label>
        <input
          type="checkbox"
          checked={preferences.priceAlerts}
          onChange={() => handleToggle('priceAlerts')}
        />
        Price drop alerts
      </label>

      <label>
        <input
          type="checkbox"
          checked={preferences.bookingUpdates}
          onChange={() => handleToggle('bookingUpdates')}
        />
        Booking updates
      </label>

      {/* ... other preferences ... */}
    </div>
  );
};
```

---

## Notification Types

### 1. Price Drop Alerts

Sent when flight prices decrease for user-tracked routes.

**Backend Function:**
```javascript
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
```

**Usage Example:**
```javascript
// In price monitoring service
const priceChanged = checkPriceChange(alert);
if (priceChanged && priceChanged.newPrice < priceChanged.oldPrice) {
  await sendPriceDropNotification(alert.userId, {
    from: 'JFK',
    to: 'LAX',
    oldPrice: 450,
    newPrice: 320,
    departureDate: '2025-07-15',
  });
}
```

**User Experience:**
```
┌─────────────────────────────────────┐
│ ✈️ Price Drop Alert!                │
│                                     │
│ JFK → LAX on 2025-07-15            │
│ Was $450, now $320                 │
│ Save $130 (29% off!)               │
└─────────────────────────────────────┘
```

### 2. Booking Confirmations

Sent immediately after successful booking.

**Backend Function:**
```javascript
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
```

**Integration Example:**
```javascript
// In booking controller
const booking = await createBooking(bookingData);

if (booking.success) {
  // Send confirmation notification
  await sendBookingConfirmationNotification(userId, {
    bookingId: booking.id,
    flightNumber: 'AA123',
    from: 'JFK',
    to: 'LAX',
    departureDate: '2025-07-15',
  });

  res.json({ success: true, booking });
}
```

### 3. Flight Reminders

Sent 24 hours before flight departure.

**Backend Function:**
```javascript
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
```

**Scheduled Job Example:**
```javascript
// In cron job or scheduled task
const checkFlightReminders = async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const upcomingFlights = await db.collection('bookings')
    .where('departureDate', '==', tomorrow.toISOString().split('T')[0])
    .get();

  for (const flight of upcomingFlights.docs) {
    const data = flight.data();
    await sendFlightReminderNotification(data.userId, {
      flightNumber: data.flightNumber,
      from: data.origin,
      to: data.destination,
      departureDate: data.departureDate,
      departureTime: data.departureTime,
    });
  }
};

// Run every hour
setInterval(checkFlightReminders, 60 * 60 * 1000);
```

### 4. Promotional Notifications

Sent for special offers and promotions.

**Backend Function:**
```javascript
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
```

**Marketing Campaign Example:**
```javascript
// Send to all users who opted into promotions
const usersOptedIn = await db.collection('notification-preferences')
  .where('promotions', '==', true)
  .get();

for (const userDoc of usersOptedIn.docs) {
  await sendPromotionalNotification(userDoc.id, {
    title: 'Summer Sale!',
    message: 'Get 25% off all domestic flights this weekend only!',
    url: '/deals/summer-sale',
  });
}
```

---

## Testing Guide

### 1. Local Testing Setup

**Step 1: Start Backend Server**
```bash
cd server
npm install web-push
node server.js
```

**Step 2: Start Frontend**
```bash
npm run dev
```

**Step 3: Enable HTTPS (Required for Push Notifications)**

Push notifications require HTTPS in production, but localhost works for testing. For local HTTPS testing:

```bash
# Option 1: Use ngrok
npx ngrok http 5173

# Option 2: Use Vite HTTPS
# Update vite.config.ts
server: {
  https: true,
  port: 5173,
}
```

### 2. Manual Testing

**Test Notification Subscription:**

1. Open browser DevTools → Console
2. Run:
```javascript
// Request permission
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission);
});

// Subscribe to push
navigator.serviceWorker.ready.then(registration => {
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
  }).then(subscription => {
    console.log('Subscription:', subscription.toJSON());
  });
});
```

3. Copy the subscription object and save it

**Test Sending Notification:**

Using curl:
```bash
curl -X POST http://localhost:3001/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "test-user-123",
    "title": "Test Notification",
    "body": "This is a test push notification",
    "data": {
      "type": "test",
      "url": "/dashboard"
    }
  }'
```

Using the test component:
```typescript
// Create src/components/NotificationTester.tsx
const NotificationTester = () => {
  const testNotification = async () => {
    const response = await fetch('http://localhost:3001/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${yourToken}`,
      },
      body: JSON.stringify({
        userId: 'your-user-id',
        title: 'Test Notification',
        body: 'Testing push notifications!',
        data: { type: 'test', url: '/dashboard' },
      }),
    });

    const result = await response.json();
    console.log('Result:', result);
  };

  return (
    <button onClick={testNotification}>
      Send Test Notification
    </button>
  );
};
```

### 3. Automated Testing

**Backend Tests:**

```javascript
// server/tests/notifications.test.js
const request = require('supertest');
const app = require('../server');

describe('Notification API', () => {
  describe('POST /api/notifications/subscribe', () => {
    it('should subscribe user to push notifications', async () => {
      const subscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key',
        },
      };

      const response = await request(app)
        .post('/api/notifications/subscribe')
        .set('Authorization', 'Bearer test-token')
        .send({
          subscription,
          userId: 'test-user-123',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/notifications/send', () => {
    it('should send push notification to user', async () => {
      const response = await request(app)
        .post('/api/notifications/send')
        .set('Authorization', 'Bearer admin-token')
        .send({
          userId: 'test-user-123',
          title: 'Test Notification',
          body: 'Test message',
          data: { type: 'test' },
        });

      expect(response.status).toBe(200);
      expect(response.body.data.successCount).toBeGreaterThan(0);
    });
  });
});
```

---

## Browser Compatibility

### Supported Browsers

| Browser | Version | Support Level |
|---------|---------|---------------|
| Chrome | 50+ | ✅ Full Support |
| Firefox | 44+ | ✅ Full Support |
| Edge | 17+ | ✅ Full Support |
| Safari (macOS) | 16+ | ✅ Full Support |
| Safari (iOS) | 16.4+ | ⚠️ Limited (requires Add to Home Screen) |
| Opera | 37+ | ✅ Full Support |
| Samsung Internet | 5+ | ✅ Full Support |

### Feature Detection

Always check for push notification support:

```typescript
export const isPushNotificationSupported = (): boolean => {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

// Usage
if (isPushNotificationSupported()) {
  // Show notification UI
  subscribeToPushNotifications();
} else {
  // Show fallback (email preferences, SMS, etc.)
  console.log('Push notifications not supported');
}
```

### iOS Considerations

**Important Limitations:**
- iOS Safari requires the website to be added to the home screen (PWA)
- Notifications only work for installed PWAs on iOS
- User must explicitly add to home screen for push to work

**Implementation:**
```typescript
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

const isInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches;
};

if (isIOS() && !isInstalled()) {
  // Show "Add to Home Screen" prompt
  showInstallPrompt();
} else {
  // Normal push notification flow
  requestNotificationPermission();
}
```

---

## Troubleshooting

### Common Issues

#### 1. "Push subscription has unsubscribed or expired"

**Problem:** Subscription endpoint returns 404 or 410 error

**Solution:**
```javascript
// The backend automatically handles this
if (error.statusCode === 410 || error.statusCode === 404) {
  // Mark subscription as inactive
  await doc.ref.update({ isActive: false });
}

// Frontend: Re-subscribe on error
try {
  await sendNotification(subscription);
} catch (error) {
  if (error.code === 'expired-subscription') {
    // Re-subscribe user
    const newSubscription = await subscribeToPushNotifications();
    await sendNotification(newSubscription);
  }
}
```

#### 2. "Notifications not showing"

**Checklist:**
1. ✅ Check browser notification permission: `Notification.permission === 'granted'`
2. ✅ Verify service worker is active: Check DevTools → Application → Service Workers
3. ✅ Check VAPID keys are configured correctly in backend
4. ✅ Ensure subscription is stored in database
5. ✅ Verify payload format is correct (must be JSON string)
6. ✅ Check browser console for errors

**Debug Script:**
```javascript
// Run in browser console
console.log('Permission:', Notification.permission);

navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);

  reg.pushManager.getSubscription().then(sub => {
    console.log('Subscription:', sub?.toJSON());
  });
});
```

#### 3. "Invalid VAPID Key"

**Error:** `InvalidState: The public key must be exactly 65 bytes`

**Solution:**
```typescript
// Ensure proper base64 conversion
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
};

// Use the converted key
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
});
```

#### 4. "Service Worker not updating"

**Problem:** Changes to service worker not taking effect

**Solution:**
```javascript
// Force update service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  for (let registration of registrations) {
    registration.update();
  }
});

// Or unregister and re-register
navigator.serviceWorker.getRegistrations().then(registrations => {
  for (let registration of registrations) {
    registration.unregister();
  }
}).then(() => {
  navigator.serviceWorker.register('/sw.js');
});
```

#### 5. CORS Issues

**Error:** `Cross-Origin Request Blocked`

**Solution:**
```javascript
// Backend: Enable CORS for notification endpoints
const cors = require('cors');

app.use('/api/notifications', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

## Security Considerations

### 1. VAPID Key Protection

**Best Practices:**
- ✅ Store private key in environment variables
- ✅ Never commit private key to version control
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys periodically (every 6-12 months)
- ✅ Use secret management services in production (AWS Secrets Manager, Google Secret Manager)

**Key Rotation Process:**
```javascript
// 1. Generate new VAPID keys
npx web-push generate-vapid-keys

// 2. Update backend with new keys
// Keep old keys active for grace period

// 3. Re-subscribe all active users
const migrateSubscriptions = async () => {
  const subscriptions = await db.collection('notification-subscriptions')
    .where('isActive', '==', true)
    .get();

  for (const doc of subscriptions.docs) {
    // Notify users to re-enable notifications
    await sendEmailNotification(doc.data().userId,
      'Please re-enable push notifications in your settings'
    );
  }
};

// 4. Remove old keys after migration complete
```

### 2. User Privacy

**Data Minimization:**
```javascript
// Only store necessary subscription data
const subscriptionData = {
  userId,
  endpoint: subscription.endpoint, // Opaque identifier
  keys: subscription.keys, // Encrypted keys
  expirationTime: subscription.expirationTime,
  createdAt: new Date().toISOString(),
  isActive: true,
  // ❌ Don't store: IP address, device info, location
};
```

**User Control:**
```typescript
// Provide easy unsubscribe
export const UnsubscribeButton = () => {
  const handleUnsubscribe = async () => {
    const confirmed = confirm('Are you sure you want to disable notifications?');
    if (confirmed) {
      await unsubscribeFromPushNotifications();
      alert('Notifications disabled successfully');
    }
  };

  return <button onClick={handleUnsubscribe}>Disable Notifications</button>;
};
```

### 3. Rate Limiting

Prevent notification spam:

```javascript
// Backend: Rate limit per user
const rateLimit = require('express-rate-limit');

const notificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Max 10 notifications per user per hour
  keyGenerator: (req) => req.body.userId,
  message: 'Too many notifications sent. Please try again later.',
});

app.post('/api/notifications/send', notificationLimiter, sendNotification);
```

### 4. Content Validation

Sanitize notification content:

```javascript
const sanitizeNotificationContent = (content) => {
  // Remove HTML tags
  const sanitized = content.replace(/<[^>]*>/g, '');

  // Limit length
  const maxLength = 200;
  const truncated = sanitized.substring(0, maxLength);

  // Escape special characters
  return truncated
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Use in notification sending
const payload = JSON.stringify({
  title: sanitizeNotificationContent(title),
  body: sanitizeNotificationContent(body),
  // ... rest of payload
});
```

---

## Production Deployment

### 1. Environment Configuration

**Production `.env`:**
```env
# VAPID Keys (Generate new keys for production!)
VAPID_PUBLIC_KEY=your_production_public_key
VAPID_PRIVATE_KEY=your_production_private_key
VAPID_SUBJECT=https://yourdomain.com

# Push Service Configuration
PUSH_TTL=86400
PUSH_URGENCY=normal

# Notification Settings
MAX_NOTIFICATIONS_PER_HOUR=10
NOTIFICATION_RETRY_ATTEMPTS=3
```

**Frontend Production `.env`:**
```env
VITE_VAPID_PUBLIC_KEY=your_production_public_key
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 2. HTTPS Requirement

Push notifications require HTTPS in production:

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Database Indexes

Create Firestore indexes for optimal performance:

**firestore.indexes.json:**
```json
{
  "indexes": [
    {
      "collectionGroup": "notification-subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "isActive", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "notification-subscriptions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "endpoint", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

### 4. Monitoring and Logging

**Backend Logging:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'notifications-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'notifications.log' }),
  ],
});

// Log notification sends
export const sendNotification = async (req, res) => {
  logger.info('Notification send request', {
    userId: req.body.userId,
    type: req.body.data?.type,
    timestamp: new Date().toISOString(),
  });

  try {
    // ... send notification ...

    logger.info('Notification sent successfully', {
      userId: req.body.userId,
      successCount,
      failureCount,
    });
  } catch (error) {
    logger.error('Notification send failed', {
      userId: req.body.userId,
      error: error.message,
      stack: error.stack,
    });
  }
};
```

**Success Metrics:**
```javascript
// Track notification delivery rates
const trackNotificationMetrics = async (results) => {
  const metrics = {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    deliveryRate: (results.filter(r => r.success).length / results.length) * 100,
  };

  // Send to analytics service
  await analytics.track('notification_delivery', metrics);

  // Alert if delivery rate drops below threshold
  if (metrics.deliveryRate < 90) {
    await alertOps('Low notification delivery rate', metrics);
  }
};
```

### 5. Scalability Considerations

**Batch Notification Sending:**
```javascript
const sendBatchNotifications = async (userIds, notificationData) => {
  const BATCH_SIZE = 100;
  const batches = [];

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    batches.push(userIds.slice(i, i + BATCH_SIZE));
  }

  for (const batch of batches) {
    const promises = batch.map(userId =>
      sendNotification({ body: { userId, ...notificationData } })
    );

    await Promise.all(promises);

    // Small delay between batches to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
};
```

**Queue-based Processing:**
```javascript
// Using Bull for job queues
const Queue = require('bull');
const notificationQueue = new Queue('notifications', {
  redis: { host: 'localhost', port: 6379 }
});

// Add notification to queue
notificationQueue.add('send-notification', {
  userId: 'user-123',
  title: 'Price Drop',
  body: 'Your tracked flight price dropped!',
});

// Process notifications
notificationQueue.process('send-notification', async (job) => {
  const { userId, title, body, data } = job.data;

  await sendNotification({ body: { userId, title, body, data } });
});
```

---

## Summary

Your push notification system is now fully implemented with:

✅ **Backend Infrastructure**
- Web Push integration with VAPID authentication
- Subscription management in Firestore
- Four specialized notification types
- Error handling and retry logic

✅ **Frontend Integration**
- Service Worker push event handling
- Notification permission requests
- Subscription/unsubscription utilities
- User preference management

✅ **Security**
- VAPID key protection
- User privacy controls
- Rate limiting
- Content sanitization

✅ **Production Ready**
- HTTPS configuration
- Database indexes
- Logging and monitoring
- Scalability considerations

### Next Steps

1. Generate production VAPID keys
2. Configure environment variables
3. Test notification delivery
4. Deploy to production with HTTPS
5. Monitor delivery rates and user engagement

For support or questions, refer to:
- [Web Push Protocol (RFC 8030)](https://tools.ietf.org/html/rfc8030)
- [MDN Push API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [web-push Library Documentation](https://github.com/web-push-libs/web-push)
