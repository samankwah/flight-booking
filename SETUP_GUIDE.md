# Admin Dashboard Setup Guide

## Complete Setup Instructions

This guide provides detailed instructions for setting up the admin dashboard from scratch.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Firebase Configuration](#firebase-configuration)
4. [Creating Admin Users](#creating-admin-users)
5. [Security Rules](#security-rules)
6. [Testing](#testing)
7. [Deployment](#deployment)

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase account with a project created
- Basic knowledge of React and TypeScript
- Code editor (VS Code recommended)

## Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd flight-booking
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Firebase Configuration

### 1. Firestore Database Setup

Create the following collections in Firestore:

#### users Collection

```javascript
{
  uid: "user_uid",
  email: "user@example.com",
  displayName: "User Name",
  role: "user" | "admin",
  createdAt: "2025-01-01T00:00:00.000Z",
  photoURL: "url_to_photo",
  phoneNumber: "+1234567890",
  emailVerified: true,
  lastLoginAt: "2025-01-01T00:00:00.000Z",
  bookingsCount: 0
}
```

#### bookings Collection

```javascript
{
  id: "booking_id",
  userId: "user_uid",
  flightId: "flight_id",
  flightDetails: {
    airline: "Airline Name",
    departureAirport: "JFK",
    arrivalAirport: "LAX",
    departureTime: "10:00",
    arrivalTime: "14:00",
    duration: 360,
    stops: 0,
    price: 500,
    currency: "USD"
  },
  passengerInfo: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890"
  },
  selectedSeats: ["12A", "12B"],
  bookingDate: "2025-01-01T00:00:00.000Z",
  status: "confirmed" | "pending" | "cancelled",
  totalPrice: 500,
  currency: "USD",
  paymentId: "payment_id",
  paymentStatus: "paid" | "pending" | "failed"
}
```

#### specialOffers Collection

```javascript
{
  id: "offer_id",
  title: "Offer Title",
  description: "Offer description",
  image: "url_to_image",
  destination: "Paris",
  country: "France",
  price: 500,
  currency: "USD",
  originalPrice: 700,
  discount: 28,
  validFrom: "2025-01-01",
  validUntil: "2025-12-31",
  category: "flight" | "hotel" | "package" | "visa",
  featured: true,
  active: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  terms: "Terms and conditions",
  highlights: ["Highlight 1", "Highlight 2"]
}
```

#### topDeals Collection

```javascript
{
  id: "deal_id",
  title: "Deal Title",
  description: "Deal description",
  image: "url_to_image",
  destination: "Maldives",
  country: "Maldives",
  price: 1500,
  currency: "USD",
  rating: 4.5,
  reviews: 120,
  perNight: true,
  category: "Luxury Resort",
  featured: true,
  active: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
  amenities: ["Pool", "Spa", "Restaurant"],
  inclusions: ["Breakfast", "Airport Transfer"]
}
```

### 2. Firestore Security Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }

    // Users collection
    match /users/{userId} {
      // Anyone can read user data
      allow read: if isAuthenticated();

      // Users can create their own document
      allow create: if request.auth.uid == userId;

      // Users can update their own document, admins can update any
      allow update: if request.auth.uid == userId || isAdmin();

      // Only admins can delete users
      allow delete: if isAdmin();
    }

    // Bookings collection
    match /bookings/{bookingId} {
      // Users can read their own bookings, admins can read all
      allow read: if isAuthenticated() &&
                     (resource.data.userId == request.auth.uid || isAdmin());

      // Users can create bookings
      allow create: if isAuthenticated();

      // Only admins can update bookings
      allow update: if isAdmin();

      // Only admins can delete bookings
      allow delete: if isAdmin();
    }

    // Special Offers collection
    match /specialOffers/{offerId} {
      // Everyone can read active offers
      allow read: if true;

      // Only admins can write
      allow write: if isAdmin();
    }

    // Top Deals collection
    match /topDeals/{dealId} {
      // Everyone can read active deals
      allow read: if true;

      // Only admins can write
      allow write: if isAdmin();
    }
  }
}
```

### 3. Firebase Authentication

Enable the following sign-in methods in Firebase Console:
- Email/Password
- Google (optional)

## Creating Admin Users

### Method 1: Via Firestore Console (Easiest)

1. Go to Firebase Console
2. Select your project
3. Navigate to Firestore Database
4. Go to the `users` collection
5. Find the user document or create a new one
6. Add/update the `role` field to `"admin"`

### Method 2: Via Firebase Admin SDK (Recommended for Production)

Create a Node.js script:

```javascript
// createAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createAdminUser(email, displayName) {
  try {
    // Create user in Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: 'temporary-password-123', // User should change this
      displayName: displayName,
      emailVerified: true
    });

    // Add user to Firestore with admin role
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      role: 'admin',
      createdAt: new Date().toISOString(),
      emailVerified: true,
      bookingsCount: 0
    });

    console.log('Admin user created successfully!');
    console.log('UID:', userRecord.uid);
    console.log('Email:', email);
    console.log('Temporary Password: temporary-password-123');
    console.log('Please ask the user to change their password!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Usage
createAdminUser('admin@example.com', 'Admin User');
```

Run the script:
```bash
node createAdmin.js
```

### Method 3: Promote Existing User

```javascript
// promoteToAdmin.js
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function promoteUserToAdmin(email) {
  try {
    const userRecord = await admin.auth().getUserByEmail(email);

    await db.collection('users').doc(userRecord.uid).update({
      role: 'admin',
      updatedAt: new Date().toISOString()
    });

    console.log(`User ${email} promoted to admin!`);
  } catch (error) {
    console.error('Error promoting user:', error);
  }
}

// Usage
promoteUserToAdmin('existing@example.com');
```

## Testing

### 1. Start Development Server

```bash
npm run dev
```

### 2. Test User Flow

1. Register a new user account at `/register`
2. Promote the user to admin (using one of the methods above)
3. Log out and log back in
4. Navigate to `/admin`
5. You should see the admin dashboard

### 3. Test Admin Features

#### Dashboard
- Verify statistics are displayed correctly
- Check that recent bookings appear
- Ensure percentage changes calculate properly

#### Bookings Management
- Create a test booking
- Search for the booking
- Update booking status
- Delete the booking

#### Users Management
- View all users
- Search for specific users
- Change user roles
- Verify role changes take effect

#### Special Offers
- Create a new offer
- Edit the offer
- Toggle active status
- Delete the offer

#### Top Deals
- Create a new deal
- Edit the deal
- Toggle active status
- Delete the deal

## Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Deploy to Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### 3. Environment Variables

Ensure all environment variables are set in your hosting platform:

For Firebase Hosting, create `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Post-Deployment Checklist

- [ ] Verify admin users can access `/admin`
- [ ] Verify regular users cannot access `/admin`
- [ ] Test all CRUD operations in production
- [ ] Check Firestore security rules are active
- [ ] Verify authentication works correctly
- [ ] Test on mobile devices
- [ ] Monitor error logs
- [ ] Set up analytics (optional)

## Maintenance

### Regular Tasks

1. **Review Users**: Regularly check the users list and remove unauthorized admin accounts
2. **Monitor Bookings**: Check for unusual booking patterns
3. **Update Offers**: Keep special offers current and remove expired ones
4. **Backup Data**: Regularly export Firestore data
5. **Security Audit**: Review Firestore security rules quarterly

### Updating Admin Features

To add new admin features:

1. Create new component in `src/pages/admin/`
2. Add route in `App.tsx`
3. Add navigation link in `AdminLayout.tsx`
4. Update TypeScript types in `src/types/index.ts`
5. Test thoroughly before deploying

## Troubleshooting

### Common Issues

**Issue**: "Access Denied" when accessing `/admin`

**Solution**:
- Verify user has `role: "admin"` in Firestore
- Log out and log back in
- Check browser console for auth errors

**Issue**: Data not loading in admin dashboard

**Solution**:
- Check Firestore security rules
- Verify collections exist in Firestore
- Check network tab for failed requests

**Issue**: Can't update/delete items

**Solution**:
- Verify Firestore security rules allow admin writes
- Check that user role is properly set
- Look for JavaScript errors in console

## Support

For additional help:
- Check the `ADMIN_IMPLEMENTATION_SUMMARY.md` for technical details
- Review the `QUICK_START_ADMIN.md` for usage instructions
- Check Firebase documentation for Firestore and Auth
- Review the codebase in `src/pages/admin/`

---

**Congratulations!** Your admin dashboard is now set up and ready to use. 🎉
