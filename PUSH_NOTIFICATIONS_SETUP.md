# Push Notifications Setup Guide

This guide explains how to set up push notifications for the Flight Booking application.

## Overview

The application uses the Web Push API to send push notifications to users. Notifications include:
- **Price Alerts**: When flight prices drop for saved routes
- **Booking Updates**: Confirmation and status updates for bookings
- **Flight Reminders**: Reminders before scheduled flights
- **Promotions**: Special offers and discounts (opt-in)

## Prerequisites

- Node.js installed
- Firebase project set up
- HTTPS enabled (required for service workers and push notifications)

## Setup Steps

### 1. Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for web push notifications.

```bash
# Install web-push globally (if not already installed)
npm install -g web-push

# Generate VAPID keys
npx web-push generate-vapid-keys
```

This will output something like:
```
=======================================

Public Key:
BHxT...your-public-key...xyz

Private Key:
abc...your-private-key...123

=======================================
```

### 2. Configure Environment Variables

Add the VAPID keys to your environment files:

**Frontend (.env or .env.local):**
```env
VITE_VAPID_PUBLIC_KEY=BHxT...your-public-key...xyz
```

**Backend (server/.env):**
```env
VAPID_PUBLIC_KEY=BHxT...your-public-key...xyz
VAPID_PRIVATE_KEY=abc...your-private-key...123
VAPID_SUBJECT=mailto:your-email@example.com
```

**Important:**
- Keep your private key secure and never commit it to version control
- The subject should be a mailto: link or your website URL

### 3. Install Required Backend Packages

The backend needs the `web-push` library to send push notifications:

```bash
cd server
npm install web-push
```

### 4. Update Service Worker Registration

The service worker (`public/sw.js`) is already configured to handle push notifications. Make sure it's properly registered in your app.

### 5. Testing Push Notifications

#### Test in Development

1. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

2. Start the frontend:
   ```bash
   npm run dev
   ```

3. Open the app and log in

4. Navigate to the Dashboard

5. In the Notification Settings section:
   - Click "Enable" to grant notification permissions
   - Configure your preferences
   - Click "Send Test Notification" to test

#### Test Notification Programmatically

You can also test sending notifications via the API:

```bash
# Get your auth token from localStorage after logging in
# Then send a test notification

curl -X POST http://localhost:3001/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "userId": "YOUR_USER_ID",
    "title": "Test Notification",
    "body": "This is a test notification",
    "data": {
      "url": "/dashboard"
    }
  }'
```

## Implementation Details

### Frontend Components

1. **NotificationPreferences** (`src/components/NotificationPreferences.tsx`)
   - UI for managing notification settings
   - Permission requests
   - Test notifications

2. **NotificationInitializer** (`src/components/NotificationInitializer.tsx`)
   - Automatically initializes notifications when user logs in
   - Subscribes to push notifications if permission granted

3. **Notification Utils** (`src/utils/notifications.ts`)
   - Core notification functionality
   - Permission handling
   - Subscription management
   - Specialized notifications (price drops, booking confirmations)

### Backend Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`):

- `POST /api/notifications/subscribe` - Subscribe to push notifications
- `POST /api/notifications/unsubscribe` - Unsubscribe from notifications
- `GET /api/notifications/preferences` - Get user preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/send` - Send notification (admin)

### Database Collections

**Firestore Collections:**

1. `notification-subscriptions`
   ```typescript
   {
     userId: string;
     endpoint: string;
     keys: {
       p256dh: string;
       auth: string;
     };
     expirationTime: number | null;
     createdAt: string;
     isActive: boolean;
   }
   ```

2. `notification-preferences`
   ```typescript
   {
     priceAlerts: boolean;
     bookingUpdates: boolean;
     promotions: boolean;
     flightReminders: boolean;
     updatedAt: string;
   }
   ```

## Browser Support

Push notifications are supported in:
- Chrome/Edge 42+
- Firefox 44+
- Safari 16+ (macOS 13+, iOS 16.4+)
- Opera 29+

The app automatically checks for support and only shows notification features if supported.

## Security Considerations

1. **VAPID Keys**: Keep private keys secure and never expose them in client-side code
2. **HTTPS Required**: Push notifications only work over HTTPS (except localhost)
3. **User Permission**: Always respect user permission choices
4. **Token Authentication**: All notification endpoints require valid authentication
5. **Rate Limiting**: Consider implementing rate limits for notification sends

## Troubleshooting

### Notifications not appearing

1. **Check browser permissions**: Ensure notifications are allowed in browser settings
2. **Check HTTPS**: Service workers require HTTPS (or localhost)
3. **Check service worker**: Open DevTools → Application → Service Workers
4. **Check console**: Look for error messages in browser console
5. **Check VAPID keys**: Ensure keys are correctly configured

### Permission denied

- If user denied permissions, they must manually re-enable in browser settings
- Chrome: Settings → Privacy and security → Site Settings → Notifications
- Firefox: Settings → Privacy & Security → Permissions → Notifications

### Subscription failures

1. Verify VAPID public key is correctly configured
2. Check service worker is registered and active
3. Verify backend is receiving subscription data
4. Check Firestore rules allow writing to notification-subscriptions

## Production Deployment

### Before deploying to production:

1. Generate new VAPID keys for production (don't reuse dev keys)
2. Ensure HTTPS is enabled on your domain
3. Update VAPID_SUBJECT to your production domain or email
4. Configure Firebase Cloud Messaging (FCM) for better delivery
5. Set up monitoring for notification delivery rates
6. Implement proper error handling and logging
7. Consider notification scheduling and batching

### Firebase Cloud Messaging (Optional Enhancement)

For better delivery and additional features, integrate with Firebase Cloud Messaging:

1. Enable FCM in Firebase Console
2. Add Firebase messaging to frontend
3. Update service worker to use FCM
4. Use Firebase Admin SDK to send notifications

## API Reference

### Subscribe to Notifications

```typescript
import { initNotifications } from './utils/notifications';

const result = await initNotifications({
  vapidPublicKey: 'YOUR_PUBLIC_KEY',
  userId: 'user123',
  autoRequest: false,
});

console.log(result.permission); // 'granted', 'denied', or 'default'
```

### Show Custom Notification

```typescript
import { showNotification } from './utils/notifications';

await showNotification('Flight Update', {
  body: 'Your flight is boarding soon!',
  icon: '/icons/icon-192x192.png',
  tag: 'flight-reminder',
  requireInteraction: true,
  actions: [
    { action: 'view', title: 'View Details' },
    { action: 'dismiss', title: 'Dismiss' },
  ],
});
```

### Show Price Drop Alert

```typescript
import { showPriceDropNotification } from './utils/notifications';

await showPriceDropNotification(
  'JFK',  // from
  'LAX',  // to
  450,    // old price
  320     // new price
);
```

## Support

For issues or questions:
- Check browser console for errors
- Review service worker logs in DevTools
- Verify Firebase configuration
- Check backend logs for API errors
