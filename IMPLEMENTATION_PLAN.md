# Flight Booking & Admin Dashboard - Implementation Plan

**Project**: Flight Booking Platform with Study Abroad Integration
**Date**: December 2025
**Status**: Ready for Implementation

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Part 1: Professional Booking Flow](#part-1-professional-booking-flow)
4. [Part 2: Admin Dashboard](#part-2-admin-dashboard)
5. [Data Models](#data-models)
6. [API Endpoints](#api-endpoints)
7. [File Structure](#file-structure)
8. [Security](#security)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Overview

This document outlines the implementation plan for two major features:

### Part 1: Professional Booking Flow
Industry-standard guest checkout flow where users can browse offers/deals, search flights, and fill booking forms without authentication. Authentication is only required at the payment step.

**Key Features**:
- ✅ Guest checkout until payment
- ✅ Offer/Deal → Flight search navigation
- ✅ Real-time Amadeus API integration
- ✅ Session state persistence
- ✅ Price comparison with offer prices

### Part 2: Admin Dashboard
Comprehensive admin panel with role-based access control for managing bookings, users, offers, deals, and study abroad programs.

**Key Features**:
- ✅ Flight booking management (CRUD, refunds, status tracking)
- ✅ User management (admin roles, account control)
- ✅ Study abroad management (universities, applications, programs)
- ✅ Analytics & reporting with charts
- ✅ Email notifications (bookings, applications)
- ✅ Export functionality (CSV/Excel/PDF)

---

## Architecture

### Technology Stack

**Frontend**:
- React 18.3.1 + TypeScript
- Tailwind CSS
- React Router v6
- Firebase Client SDK (Auth)
- Recharts (Analytics)
- React Hot Toast (Notifications)

**Backend**:
- Node.js + Express.js
- Firebase Admin SDK
- Firestore Database
- SendGrid (Email service)
- Export libraries (json2csv, exceljs, pdfkit)

**External APIs**:
- Amadeus Flight API
- Paystack Payment Gateway

### Authentication Flow

```
Guest User Flow:
1. Browse offers/deals (no auth)
2. Search flights (no auth)
3. Select flight → Navigate to booking (no auth)
4. Fill passenger info (no auth)
5. Select seats (no auth)
6. Payment step → Auth required
   - Show "Sign In to Complete Payment" button
   - Open AuthenticationModal
   - After login → Show payment form
7. Complete payment → Save booking

Admin User Flow:
1. Login with admin credentials
2. Firebase verifies ID token
3. Check Custom Claims for admin role
4. If admin → Access admin panel
5. If not admin → Show access denied
```

---

## Part 1: Professional Booking Flow

### Objectives
- Remove authentication barriers before payment
- Seamless offer/deal to flight search navigation
- Persist booking state across sessions
- Display offer context during flight search

### Implementation Steps

#### Step 1: Remove Authentication Barriers

**File**: `src/App.tsx`
```tsx
// BEFORE: Booking route is protected
<Route element={<ProtectedRoute />}>
  <Route path="/booking" element={<BookingPage />} />
</Route>

// AFTER: Booking route is public
<Route path="/booking" element={<BookingPage />} />
```

**File**: `src/pages/BookingPage.tsx`
- Initialize form with empty strings (not user data)
- Remove auth check from payment handler
- Replace Step 3 payment section with `<PaymentStepWithAuth />`

#### Step 2: Create Authentication Components

**New File**: `src/components/AuthenticationModal.tsx`
- Login/Register tabs
- Email/password form + Google/Apple OAuth
- Success callback to resume payment flow
- Dismissable modal

**New File**: `src/components/PaymentStepWithAuth.tsx`
- If not authenticated: Show "Sign In to Complete Payment" button
- If authenticated: Show PaystackProvider + PaymentForm
- Opens AuthenticationModal when button clicked

#### Step 3: Airport Lookup & Navigation

**New File**: `src/utils/airportLookup.ts`
```typescript
export const DESTINATION_AIRPORTS: Record<string, string> = {
  'Melbourne': 'MEL',
  'Jakarta': 'CGK',
  'Antarctica': 'TNM',
  'Pyramids of Giza': 'CAI',
  // ... all destinations
};

export const getAirportCode(destination: string, country: string): string;
export const getSmartDepartureDate(): string; // 2 weeks from today
export const getSmartReturnDate(departureDate: string): string; // 1 week after
```

**Update Files**:
- `src/pages/SpecialOfferDetailPage.tsx` - Add `buildOfferSearchUrl()` helper
- `src/pages/TopDealDetailPage.tsx` - Add `buildDealSearchUrl()` helper
- `src/components/DealDetailModal.tsx` - Update `handleBookNow()` to navigate to flight search

#### Step 4: Offer Context & Price Comparison

**File**: `src/pages/FlightSearchPage.tsx`
- Extract `offerId`, `dealId`, `suggestedPrice` from URL
- Add offer context banner (image, name, country, reference price)
- Make banner dismissable

**File**: `src/components/FlightResults.tsx`
- Add price comparison badges:
  - Green: "$ cheaper!" (flight < offer price)
  - Blue: "Matches offer price" (flight == offer price)
  - Amber: "$ more" (flight > offer price)

#### Step 5: State Persistence

**New File**: `src/hooks/useBookingState.ts`
```typescript
interface BookingState {
  flight: FlightResult | null;
  passengerInfo: { firstName, lastName, email, phone, paymentMethod };
  selectedSeats: SeatType[];
  step: number;
  timestamp: number;
}

export const useBookingState = () => ({
  saveBookingState,     // Save to sessionStorage
  loadBookingState,     // Load from sessionStorage (24hr expiry)
  clearBookingState,    // Remove from sessionStorage
  hasBookingState       // Check if state exists
});
```

**File**: `src/pages/BookingPage.tsx`
- Auto-save booking state on every form change (steps 1-2)
- Load booking state on mount (if exists and not expired)
- Clear state on successful payment

---

## Part 2: Admin Dashboard

### Objectives
- Secure admin authentication via Firebase Custom Claims
- Full CRUD operations for all entities
- Real-time analytics with charts
- Email notifications for all events
- Export data in multiple formats

### Backend Implementation

#### Phase 1: Firebase Admin SDK Setup

**New File**: `server/utils/firebaseAdmin.js`
```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.firestore();
const auth = admin.auth();

// Set Custom Claim for admin role
const setAdminClaim = async (uid, isAdmin = true) => {
  await auth.setCustomUserClaims(uid, { admin: isAdmin });
  await db.collection('users').doc(uid).update({ isAdmin, updatedAt: new Date() });
  return { success: true };
};

// Verify admin status
const verifyAdmin = async (uid) => {
  const user = await auth.getUser(uid);
  return user.customClaims?.admin === true;
};

module.exports = { admin, db, auth, setAdminClaim, verifyAdmin, disableUser };
```

**New File**: `server/middleware/adminAuth.js`
```javascript
const requireAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  const decodedToken = await auth.verifyIdToken(token);

  if (!decodedToken.admin) {
    return res.status(403).json({ error: 'Forbidden - Admin access required' });
  }

  req.user = { uid: decodedToken.uid, email: decodedToken.email, admin: true };
  next();
};
```

#### Phase 2: Email Service

**New File**: `server/services/emailService.js`
```javascript
const sgMail = require('@sendgrid/mail');

exports.sendBookingEmail = async (booking, status) => {
  // Send booking confirmation/cancellation/refund emails
};

exports.sendApplicationEmail = async (application, status) => {
  // Send application status update emails (accepted, rejected, under_review, waitlisted)
};
```

#### Phase 3: Export Utilities

**New Files**:
- `server/utils/csvExport.js` - CSV generation using json2csv
- `server/utils/excelExport.js` - Excel generation using exceljs
- `server/utils/pdfExport.js` - PDF generation using pdfkit

### Frontend Implementation

#### Phase 1: Admin Authentication

**File**: `src/contexts/AuthContext.tsx`
```typescript
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isAdmin: boolean;  // NEW
  refreshAdminStatus: () => Promise<void>;  // NEW
}

// In AuthProvider:
const [isAdmin, setIsAdmin] = useState(false);

useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      const tokenResult = await user.getIdTokenResult();
      setIsAdmin(tokenResult.claims.admin === true);
    }
  });
  return unsubscribe;
}, []);
```

**New File**: `src/components/AdminRoute.tsx`
```typescript
export default function AdminRoute() {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!currentUser) return <Navigate to="/login" />;
  if (!isAdmin) return <AccessDeniedScreen />;

  return <Outlet />;
}
```

#### Phase 2: Admin Layout & Navigation

**New File**: `src/components/admin/AdminLayout.tsx`
```typescript
const navItems = [
  { path: '/admin', icon: MdDashboard, label: 'Dashboard' },
  { path: '/admin/bookings', icon: MdFlightTakeoff, label: 'Flight Bookings' },
  { path: '/admin/users', icon: MdPeople, label: 'Users' },
  { path: '/admin/offers', icon: MdLocalOffer, label: 'Special Offers' },
  { path: '/admin/deals', icon: MdLocalOffer, label: 'Top Deals' },
  { path: '/admin/universities', icon: MdSchool, label: 'Universities' },
  { path: '/admin/applications', icon: MdAssignment, label: 'Study Applications' },
  { path: '/admin/programs', icon: MdBook, label: 'Study Programs' },
  { path: '/admin/analytics', icon: MdAnalytics, label: 'Analytics' },
  { path: '/admin/settings', icon: MdSettings, label: 'Settings' }
];
```

#### Phase 3: Reusable Components

**New File**: `src/components/admin/DataTable.tsx`
- Generic table component with TypeScript generics
- Sorting, pagination, filtering
- Row click handlers
- Custom column renderers

**Other Components**:
- `StatCard.tsx` - Dashboard metric cards
- `FormModal.tsx` - Create/edit modals
- `StatusBadge.tsx` - Colored status indicators
- `ActionMenu.tsx` - Dropdown action menu
- `ExportButton.tsx` - Export data (CSV/Excel/PDF)

#### Phase 4: Admin Pages

All pages follow the same pattern:

```typescript
export default function AdminPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchData(); // API call to /api/admin/*
  }, [filters]);

  const handleCreate = () => { /* ... */ };
  const handleEdit = (item) => { /* ... */ };
  const handleDelete = (id) => { /* ... */ };

  return (
    <div>
      <PageHeader>
        <Filters />
        <CreateButton />
        <ExportButton />
      </PageHeader>
      <DataTable data={data} columns={columns} loading={loading} />
    </div>
  );
}
```

**Admin Pages**:
1. `AdminDashboard.tsx` - Overview with stats & charts
2. `BookingManagement.tsx` - Flight bookings CRUD
3. `UserManagement.tsx` - User & admin management
4. `OfferManagement.tsx` - Special offers CRUD
5. `DealManagement.tsx` - Top deals CRUD
6. `UniversityManagement.tsx` - Universities CRUD
7. `ApplicationManagement.tsx` - Study applications management
8. `ProgramManagement.tsx` - Study programs CRUD
9. `Analytics.tsx` - Charts & reports
10. `AdminSettings.tsx` - Admin configuration

---

## Data Models

### Firestore Collections

#### /bookings/{bookingId}
```typescript
{
  userId: string;
  flightId: string;
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: string;
  };
  seats: SeatType[];
  totalPrice: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  adminNotes?: string;
}
```

#### /universities/{universityId}
```typescript
{
  name: string;
  country: string;
  city: string;
  ranking: number;
  description: string;
  logo: string;
  images: string[];
  programs: string[];
  tuitionFees: {
    undergraduate: number;
    postgraduate: number;
    currency: string;
  };
  admissionRequirements: {
    gpa: number;
    englishTest: string;
    documents: string[];
  };
  scholarships: Array<{
    name: string;
    amount: number;
    currency: string;
    criteria: string;
  }>;
  applicationDeadline: Timestamp;
  intakeMonths: string[];
  contactEmail: string;
  website: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### /studyAbroadApplications/{applicationId}
```typescript
{
  userId: string;
  universityId: string;
  universityName: string;
  program: string;
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    currentEducationLevel: string;
    gpa: number;
  };
  documents: Array<{
    type: string;
    url: string;
    uploadedAt: Timestamp;
  }>;
  status: 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted';
  intakePeriod: string;
  submittedAt: Timestamp;
  updatedAt: Timestamp;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}
```

---

## API Endpoints

### Admin Endpoints (All require `requireAdmin` middleware)

#### Booking Management
```
GET    /api/admin/bookings              - Get all bookings (with filters)
GET    /api/admin/bookings/:id          - Get booking by ID
PATCH  /api/admin/bookings/:id          - Update booking
DELETE /api/admin/bookings/:id          - Delete booking
POST   /api/admin/bookings/:id/refund   - Refund booking
POST   /api/admin/bookings/:id/notes    - Add admin notes
```

#### User Management
```
GET    /api/admin/users                 - Get all users
GET    /api/admin/users/:id             - Get user by ID
PATCH  /api/admin/users/:id/admin       - Set admin status (Custom Claims)
PATCH  /api/admin/users/:id/disable     - Disable/enable account
GET    /api/admin/users/:id/bookings    - Get user's bookings
```

#### Study Abroad - Universities
```
GET    /api/admin/universities          - Get all universities
GET    /api/admin/universities/:id      - Get university by ID
POST   /api/admin/universities          - Create university
PATCH  /api/admin/universities/:id      - Update university
DELETE /api/admin/universities/:id      - Delete university
PATCH  /api/admin/universities/:id/featured - Toggle featured status
```

#### Study Abroad - Applications
```
GET    /api/admin/applications          - Get all applications
GET    /api/admin/applications/:id      - Get application by ID
PATCH  /api/admin/applications/:id/status - Update status (sends email)
POST   /api/admin/applications/:id/notes  - Add admin notes
DELETE /api/admin/applications/:id      - Delete application
```

#### Analytics
```
GET    /api/admin/analytics/revenue     - Revenue statistics
GET    /api/admin/analytics/bookings    - Booking trends
GET    /api/admin/analytics/routes      - Popular routes
```

#### Export
```
POST   /api/admin/export/bookings       - Export bookings (CSV/Excel/PDF)
POST   /api/admin/export/users          - Export users
POST   /api/admin/export/applications   - Export applications
POST   /api/admin/export/universities   - Export universities
```

---

## File Structure

```
flight-booking/
├── src/
│   ├── components/
│   │   ├── AuthenticationModal.tsx          ✅ NEW
│   │   ├── PaymentStepWithAuth.tsx          ✅ NEW
│   │   ├── AdminRoute.tsx                   ✅ NEW
│   │   └── admin/
│   │       ├── AdminLayout.tsx              ✅ NEW
│   │       ├── DataTable.tsx                ✅ NEW
│   │       ├── StatCard.tsx                 ✅ NEW
│   │       ├── FormModal.tsx                ✅ NEW
│   │       ├── StatusBadge.tsx              ✅ NEW
│   │       ├── ActionMenu.tsx               ✅ NEW
│   │       └── ExportButton.tsx             ✅ NEW
│   ├── pages/
│   │   ├── BookingPage.tsx                  🔄 MODIFY
│   │   ├── FlightSearchPage.tsx             🔄 MODIFY
│   │   ├── SpecialOfferDetailPage.tsx       🔄 MODIFY
│   │   ├── TopDealDetailPage.tsx            🔄 MODIFY
│   │   └── admin/
│   │       ├── AdminDashboard.tsx           ✅ NEW
│   │       ├── BookingManagement.tsx        ✅ NEW
│   │       ├── UserManagement.tsx           ✅ NEW
│   │       ├── OfferManagement.tsx          ✅ NEW
│   │       ├── DealManagement.tsx           ✅ NEW
│   │       ├── UniversityManagement.tsx     ✅ NEW
│   │       ├── ApplicationManagement.tsx    ✅ NEW
│   │       ├── ProgramManagement.tsx        ✅ NEW
│   │       ├── Analytics.tsx                ✅ NEW
│   │       └── AdminSettings.tsx            ✅ NEW
│   ├── hooks/
│   │   └── useBookingState.ts               ✅ NEW
│   ├── utils/
│   │   └── airportLookup.ts                 ✅ NEW
│   ├── contexts/
│   │   └── AuthContext.tsx                  🔄 MODIFY
│   └── App.tsx                              🔄 MODIFY
│
├── server/
│   ├── utils/
│   │   ├── firebaseAdmin.js                 ✅ NEW
│   │   ├── csvExport.js                     ✅ NEW
│   │   ├── excelExport.js                   ✅ NEW
│   │   └── pdfExport.js                     ✅ NEW
│   ├── middleware/
│   │   └── adminAuth.js                     ✅ NEW
│   ├── routes/
│   │   └── adminRoutes.js                   ✅ NEW
│   ├── controllers/
│   │   └── adminController.js               ✅ NEW
│   ├── services/
│   │   └── emailService.js                  ✅ NEW
│   ├── scripts/
│   │   └── migrateData.js                   ✅ NEW
│   └── server.js                            🔄 MODIFY
│
└── firestore.rules                          🔄 MODIFY
```

---

## Security

### Firebase Custom Claims
- Server-side only (cannot be manipulated by client)
- Set via Firebase Admin SDK
- Verified on every API request
- Synced to Firestore `/users` collection

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && request.auth.token.admin == true;
    }

    // Bookings - users read their own, admins do anything
    match /bookings/{bookingId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow write: if isAdmin();
    }

    // Universities - public read, admin write
    match /universities/{universityId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Applications - users read/create their own, admins do anything
    match /studyAbroadApplications/{applicationId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }
  }
}
```

### API Security
- JWT token verification on every request
- Admin middleware checks Custom Claims
- Input validation on all endpoints
- Rate limiting on admin endpoints
- CORS configured for frontend domain only

---

## Testing

### Manual Testing Checklist

#### Part 1: Guest Booking Flow
- [ ] Browse offers/deals without login
- [ ] Click "Book Now" → Navigates to flight search with pre-filled params
- [ ] Flight search executes with Amadeus API
- [ ] Select flight → Navigate to booking (no auth)
- [ ] Fill passenger info as guest
- [ ] Select seats
- [ ] Payment step shows "Sign In to Complete Payment"
- [ ] Click button → Auth modal opens
- [ ] Register/login → Modal closes, payment form appears
- [ ] Complete payment → Booking saved to Firestore
- [ ] Session state persists on page refresh

#### Part 2: Admin Dashboard
- [ ] Non-admin users cannot access `/admin` routes
- [ ] Admin users can access all admin pages
- [ ] Custom Claims sync on login
- [ ] View/edit/delete bookings
- [ ] Refund booking → Status updated, email sent
- [ ] Assign/revoke admin roles
- [ ] Disable/enable user accounts
- [ ] View analytics charts
- [ ] Export data (CSV/Excel/PDF)
- [ ] Create/edit/delete universities
- [ ] Update application status → Email sent to student
- [ ] Firestore security rules enforced

---

## Deployment

### Environment Variables

**.env**:
```bash
# Firebase Admin SDK
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-admin-sdk.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# SendGrid
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourapp.com

# Amadeus API
AMADEUS_API_KEY=your_amadeus_key
AMADEUS_API_SECRET=your_amadeus_secret

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret
```

### Deployment Steps

1. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install firebase-admin @sendgrid/mail json2csv exceljs pdfkit

   # Frontend
   cd ..
   npm install recharts
   ```

2. **Run Data Migration**
   ```bash
   cd server
   node scripts/migrateData.js
   ```

3. **Update Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Deploy Backend**
   ```bash
   # Deploy to your hosting provider (e.g., Railway, Render, etc.)
   ```

5. **Deploy Frontend**
   ```bash
   npm run build
   # Deploy build folder to hosting (Vercel, Netlify, etc.)
   ```

---

## Implementation Timeline

### Week 1: Guest Booking Flow
- Day 1: Remove auth barriers, create auth components
- Day 2: Airport lookup, offer/deal navigation
- Day 3: Flight search context, price comparison
- Day 4: State persistence
- Day 5: Testing & bug fixes

### Week 2: Backend Foundation
- Day 1-2: Firebase Admin SDK, Custom Claims, middleware
- Day 3-4: Admin API routes & controllers
- Day 5: Email service, export utilities

### Week 3: Frontend Admin Core
- Day 1-2: AuthContext updates, AdminRoute, AdminLayout
- Day 3-4: Reusable admin components
- Day 5: Admin dashboard page

### Week 4: Admin Pages
- Day 1: BookingManagement page
- Day 2: UserManagement page
- Day 3: OfferManagement + DealManagement
- Day 4: UniversityManagement + ApplicationManagement
- Day 5: Analytics page

### Week 5: Polish & Deploy
- Day 1: Data migration
- Day 2: Frontend Firestore integration
- Day 3: Email notifications
- Day 4-5: End-to-end testing, deployment

**Total Estimated Time**: 4-5 weeks

---

## Quick Reference

### Common Tasks

**Create an admin user**:
```javascript
const { setAdminClaim } = require('./server/utils/firebaseAdmin');
await setAdminClaim('user-uid-here', true);
```

**Test admin status**:
```typescript
const { currentUser } = useAuth();
const tokenResult = await currentUser.getIdTokenResult();
console.log('Is admin:', tokenResult.claims.admin);
```

**Query Firestore with admin check**:
```typescript
const { db } = require('./server/utils/firebaseAdmin');
const snapshot = await db.collection('bookings')
  .where('status', '==', 'pending')
  .get();
```

---

## Support & Resources

**Official Documentation**:
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [SendGrid Node.js](https://github.com/sendgrid/sendgrid-nodejs)
- [Recharts](https://recharts.org/en-US/)

**Project Files**:
- Full implementation plan: `C:\Users\CRAFT\.claude\plans\lucky-mapping-ember.md`
- This documentation: `IMPLEMENTATION_PLAN.md`

---

**Last Updated**: December 2025
**Version**: 1.0
**Status**: ✅ Ready for Implementation
