# Admin Dashboard Setup Guide

Complete setup and configuration guide for the Flight Booking Admin Dashboard.

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Initial Setup](#initial-setup)
3. [Firestore Configuration](#firestore-configuration)
4. [Security Rules](#security-rules)
5. [Creating Admin Users](#creating-admin-users)
6. [Testing the Setup](#testing-the-setup)
7. [Production Deployment](#production-deployment)
8. [Advanced Configuration](#advanced-configuration)

## System Requirements

### Prerequisites
- Node.js 16+ installed
- Firebase project set up
- Firestore database enabled
- React application running
- Firebase Authentication configured

### Dependencies
All required dependencies are already included in the project:
- `firebase` - Firebase SDK
- `firestore` - Database
- `react-router-dom` - Routing
- `react-hot-toast` - Notifications
- `react-icons` - Icon library
- `@headlessui/react` - UI components

## Initial Setup

### Step 1: Verify Firebase Configuration

Ensure your Firebase configuration is correct in `src/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Step 2: Verify Component Installation

All admin components should be in place:

```
src/
├── components/
│   ├── AdminRoute.tsx
│   └── admin/
│       ├── AnalyticsDashboard.tsx
│       ├── UserManagement.tsx
│       └── BookingManagement.tsx
├── pages/
│   └── AdminDashboardPage.tsx
```

### Step 3: Check Routes

Verify the admin route is added in `src/App.tsx`:

```tsx
<Route element={<AdminRoute />}>
  <Route path="/admin" element={<AdminDashboardPage />} />
</Route>
```

## Firestore Configuration

### Required Collections

Your Firestore database needs these collections:

#### 1. `users` Collection
Structure for each user document:

```javascript
{
  uid: "user_unique_id",           // String (Document ID)
  email: "user@example.com",       // String
  displayName: "John Doe",         // String (optional)
  role: "user",                    // String: "user" | "admin" | "superadmin"
  isActive: true,                  // Boolean
  createdAt: "2024-01-01T00:00:00Z", // String (ISO timestamp)
  lastLogin: "2024-01-01T00:00:00Z", // String (ISO timestamp)
  phoneNumber: "+1234567890",      // String (optional)
  photoURL: "https://...",         // String (optional)
}
```

#### 2. `bookings` Collection
Structure for each booking document:

```javascript
{
  id: "booking_unique_id",         // String (Document ID)
  userId: "user_unique_id",        // String
  flightId: "flight_id",           // String
  flightDetails: {                 // Object
    airline: "Airline Name",
    airlineCode: "AA",
    departureAirport: "JFK",
    arrivalAirport: "LHR",
    departureTime: "2024-01-01T10:00:00Z",
    arrivalTime: "2024-01-01T22:00:00Z",
    duration: 720,                 // Number (minutes)
    stops: 0,                      // Number
    price: 599.99,                 // Number
    currency: "USD",
  },
  passengerInfo: {                 // Object
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
  },
  selectedSeats: ["12A", "12B"],   // Array of strings (optional)
  bookingDate: "2024-01-01T00:00:00Z", // String (ISO timestamp)
  status: "confirmed",             // String: "confirmed" | "pending" | "cancelled"
  totalPrice: 599.99,              // Number
  currency: "USD",                 // String
  paymentId: "payment_id",         // String (optional)
  paymentStatus: "paid",           // String: "paid" | "pending" | "failed" (optional)
}
```

### Creating Collections

If collections don't exist, they'll be created automatically when you add the first document. Alternatively, create them manually:

1. Go to Firebase Console → Firestore Database
2. Click "Start collection"
3. Enter collection ID: `users` or `bookings`
4. Add first document with the structure above

## Security Rules

### Development Rules (Testing Only)

For development, you can use these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users (DEVELOPMENT ONLY)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Production Rules (Recommended)

For production, use these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'superadmin'];
    }

    // Helper function to check if user is the owner
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      // Users can read their own document
      allow read: if isOwner(userId);

      // Users can update their own document (except role)
      allow update: if isOwner(userId) &&
        !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role']);

      // Admins can read/write all users
      allow read, write: if isAdmin();

      // Allow user creation during registration
      allow create: if request.auth != null;
    }

    // Bookings collection
    match /bookings/{bookingId} {
      // Users can read their own bookings
      allow read: if isOwner(resource.data.userId);

      // Users can create bookings for themselves
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;

      // Users can update their own pending bookings
      allow update: if isOwner(resource.data.userId) &&
        resource.data.status == 'pending';

      // Admins can read/write all bookings
      allow read, write: if isAdmin();
    }
  }
}
```

### Applying Security Rules

1. Go to Firebase Console
2. Navigate to Firestore Database → Rules
3. Copy and paste the rules above
4. Click "Publish"
5. Wait for rules to propagate (usually instant)

## Creating Admin Users

### Method 1: Firebase Console (Manual)

1. **Create User Account**
   - Register a new user through the app
   - Or create via Firebase Console → Authentication

2. **Set Admin Role**
   - Go to Firestore Database
   - Navigate to `users` collection
   - Find the user document (by UID)
   - Add/update these fields:
     ```
     role: "admin"
     isActive: true
     createdAt: "2024-01-01T00:00:00Z"
     ```

### Method 2: Cloud Function (Automated)

Create a Cloud Function to automatically set admin role:

```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.makeAdmin = functions.https.onCall(async (data, context) => {
  // Only allow if caller is already a superadmin
  const callerDoc = await admin.firestore()
    .collection('users')
    .doc(context.auth.uid)
    .get();

  if (callerDoc.data()?.role !== 'superadmin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can create admin users'
    );
  }

  // Set admin role
  await admin.firestore()
    .collection('users')
    .doc(data.userId)
    .update({
      role: data.role || 'admin',
      isActive: true
    });

  return { success: true };
});
```

### Method 3: Admin Script (Quick Setup)

Create a setup script for the first admin:

```javascript
// scripts/createFirstAdmin.js
const admin = require('firebase-admin');

// Initialize with service account
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createFirstAdmin(email, userId) {
  try {
    // Create user in Authentication if doesn't exist
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch (error) {
      user = await admin.auth().createUser({
        email: email,
        password: 'ChangeMe123!', // IMPORTANT: Change this password
        emailVerified: true,
      });
    }

    // Create/update user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      role: 'superadmin',
      isActive: true,
      createdAt: new Date().toISOString(),
      displayName: 'Super Admin',
    }, { merge: true });

    console.log('✅ First admin created successfully!');
    console.log('Email:', user.email);
    console.log('UID:', user.uid);
    console.log('⚠️ IMPORTANT: Change the password after first login!');

  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

// Usage
createFirstAdmin('admin@example.com');
```

Run with:
```bash
node scripts/createFirstAdmin.js
```

## Testing the Setup

### 1. Test Authentication
```bash
# Start the development server
npm run dev

# Open browser to http://localhost:5173
# Register a new user or log in
```

### 2. Test Admin Access

1. **Create Test Admin User**
   - Use one of the methods above to create an admin user

2. **Verify Access**
   - Log in with admin credentials
   - Check for purple "Admin" link in header
   - Click to access `/admin` route

3. **Test Each Tab**
   - ✅ Analytics: View metrics
   - ✅ Users: Search and view users
   - ✅ Bookings: View bookings list
   - ✅ Settings: View settings panel

### 3. Test User Management

1. Create a test user
2. Go to Admin → Users tab
3. Try these actions:
   - Search for user
   - Edit user role
   - Toggle active status
   - (Optional) Delete user

### 4. Test Booking Management

1. Create a test booking (book a flight)
2. Go to Admin → Bookings tab
3. Try these actions:
   - View booking details
   - Change booking status
   - Filter by status
   - Search by passenger name

### 5. Test Analytics

1. Ensure you have some test data:
   - At least 2-3 users
   - At least 5-10 bookings
   - Bookings with different statuses

2. Go to Admin → Analytics tab
3. Verify:
   - User count is correct
   - Booking count is correct
   - Revenue calculates properly
   - Charts display data

## Production Deployment

### Pre-Deployment Checklist

- [ ] Firebase production credentials configured
- [ ] Security rules applied and tested
- [ ] Admin users created
- [ ] All features tested
- [ ] Error handling verified
- [ ] Loading states working
- [ ] Responsive design tested
- [ ] Dark mode working
- [ ] Environment variables set

### Environment Variables

Create `.env.production`:

```bash
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
VITE_FIREBASE_PROJECT_ID=your_production_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_messaging_sender_id
VITE_FIREBASE_APP_ID=your_production_app_id
```

### Build for Production

```bash
# Install dependencies
npm install

# Run tests (if available)
npm test

# Build production bundle
npm run build

# Preview production build
npm run preview
```

### Deploy

**Option 1: Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy --only hosting
```

**Option 2: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option 3: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Post-Deployment

1. **Verify Admin Access**
   - Visit production URL
   - Log in as admin
   - Access `/admin` route

2. **Test Critical Paths**
   - User management
   - Booking management
   - Analytics loading

3. **Monitor Performance**
   - Check loading times
   - Monitor error logs
   - Review analytics

## Advanced Configuration

### Custom Analytics

To add custom analytics metrics, edit `AnalyticsDashboard.tsx`:

```typescript
// Add new metric
const customMetric = bookings.filter(b =>
  // Your custom logic here
).length;

// Display in dashboard
<div className="bg-white p-6 rounded-lg shadow-md">
  <h3>Custom Metric</h3>
  <p className="text-3xl font-bold">{customMetric}</p>
</div>
```

### Email Notifications

To enable email notifications for admin actions:

1. Set up Cloud Functions
2. Create email templates
3. Configure SMTP or email service
4. Add triggers in admin components

Example Cloud Function:

```javascript
exports.onBookingConfirmed = functions.firestore
  .document('bookings/{bookingId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'confirmed' && after.status === 'confirmed') {
      // Send confirmation email
      await sendEmail({
        to: after.passengerInfo.email,
        subject: 'Booking Confirmed',
        body: `Your booking ${context.params.bookingId} is confirmed!`
      });
    }
  });
```

### Custom Permissions

To add custom permission levels:

1. Update types in `src/types/index.ts`:
```typescript
export type UserRole = "user" | "admin" | "superadmin" | "moderator";
```

2. Update security rules to handle new role

3. Update `AdminRoute.tsx` to check permissions

### Data Export

To add data export functionality:

```typescript
// In AdminDashboardPage.tsx
const exportToCSV = (data: any[], filename: string) => {
  const csv = data.map(row =>
    Object.values(row).join(',')
  ).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
};
```

## Troubleshooting

### Common Issues

**Issue: Admin link not showing**
- Check user role in Firestore
- Clear cache and re-login
- Verify AuthContext is updated

**Issue: Access denied to /admin**
- Verify user has admin role
- Check Firestore security rules
- Ensure user is logged in

**Issue: Data not loading**
- Check Firestore rules
- Verify internet connection
- Check browser console for errors

**Issue: Changes not saving**
- Verify write permissions in Firestore rules
- Check for validation errors
- Review error messages in console

### Debug Mode

Enable debug logging:

```typescript
// In admin components
const DEBUG = true;

if (DEBUG) {
  console.log('Data:', data);
  console.log('Error:', error);
}
```

## Support and Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Admin Implementation Summary](./ADMIN_IMPLEMENTATION_SUMMARY.md)
- [Quick Start Guide](./QUICK_START_ADMIN.md)

---

**Setup Complete!** 🎉 Your admin dashboard is now ready for use. Refer to the Quick Start Guide for daily usage instructions.
