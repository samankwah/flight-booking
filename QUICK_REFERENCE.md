# Quick Reference Guide

**Quick access to common tasks and code snippets during implementation**

---

## File Locations

### Part 1: Guest Booking Flow
```
✅ NEW: src/components/AuthenticationModal.tsx
✅ NEW: src/components/PaymentStepWithAuth.tsx
✅ NEW: src/hooks/useBookingState.ts
✅ NEW: src/utils/airportLookup.ts
🔄 MODIFY: src/pages/BookingPage.tsx
🔄 MODIFY: src/pages/FlightSearchPage.tsx
🔄 MODIFY: src/components/FlightResults.tsx
🔄 MODIFY: src/App.tsx
```

### Part 2: Admin Dashboard
```
Backend:
✅ server/utils/firebaseAdmin.js
✅ server/middleware/adminAuth.js
✅ server/routes/adminRoutes.js
✅ server/controllers/adminController.js
✅ server/services/emailService.js

Frontend:
✅ src/components/AdminRoute.tsx
✅ src/components/admin/AdminLayout.tsx
✅ src/components/admin/DataTable.tsx
✅ src/pages/admin/* (10 pages)
🔄 src/contexts/AuthContext.tsx
```

---

## Code Snippets

### Firebase Custom Claims (Admin)

**Set admin role**:
```javascript
// server/utils/firebaseAdmin.js
const { setAdminClaim } = require('./server/utils/firebaseAdmin');
await setAdminClaim('user-uid', true);  // Make admin
await setAdminClaim('user-uid', false); // Remove admin
```

**Check admin status**:
```typescript
// Frontend
const { isAdmin } = useAuth();

// Backend
const verifyAdmin = async (uid) => {
  const user = await auth.getUser(uid);
  return user.customClaims?.admin === true;
};
```

### Authentication Flow

**Guest checkout check**:
```typescript
// In PaymentStepWithAuth.tsx
const { currentUser } = useAuth();

if (!currentUser) {
  return (
    <div>
      <PaymentSummary />
      <button onClick={() => setAuthModalOpen(true)}>
        Sign In to Complete Payment
      </button>
    </div>
  );
}

return <PaystackProvider><PaymentForm /></PaystackProvider>;
```

**Admin route protection**:
```typescript
// src/components/AdminRoute.tsx
const { currentUser, isAdmin, loading } = useAuth();

if (loading) return <LoadingScreen />;
if (!currentUser) return <Navigate to="/login" />;
if (!isAdmin) return <AccessDenied />;

return <Outlet />;
```

### Firestore Queries

**Get bookings (admin)**:
```javascript
const snapshot = await db.collection('bookings')
  .where('status', '==', 'pending')
  .orderBy('createdAt', 'desc')
  .limit(50)
  .get();

const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

**Get user's own bookings**:
```typescript
const bookings = await db.collection('bookings')
  .where('userId', '==', currentUser.uid)
  .get();
```

**Create study abroad application**:
```javascript
await db.collection('studyAbroadApplications').add({
  userId: currentUser.uid,
  universityId: 'uni-123',
  universityName: 'Harvard',
  program: 'Computer Science',
  studentInfo: { /* ... */ },
  status: 'submitted',
  submittedAt: new Date()
});
```

### Email Notifications

**Send booking email**:
```javascript
// server/services/emailService.js
const { sendBookingEmail } = require('./services/emailService');

await sendBookingEmail(booking, 'confirmed');
// Status: 'confirmed', 'cancelled', 'refunded'
```

**Send application email**:
```javascript
await sendApplicationEmail(application, 'accepted');
// Status: 'under_review', 'accepted', 'rejected', 'waitlisted'
```

### Session Storage (Booking State)

**Save booking state**:
```typescript
const { saveBookingState } = useBookingState();

saveBookingState({
  flight: selectedFlight,
  passengerInfo: formData,
  selectedSeats: seats,
  step: 2
});
```

**Load booking state**:
```typescript
const { loadBookingState } = useBookingState();

useEffect(() => {
  const savedState = loadBookingState();
  if (savedState) {
    setFlight(savedState.flight);
    setFormData(savedState.passengerInfo);
    // ... restore other state
  }
}, []);
```

**Clear on payment**:
```typescript
const handlePaymentSuccess = async () => {
  await saveBookingToFirestore();
  clearBookingState(); // Clear session storage
};
```

### Airport Lookup

**Get airport code**:
```typescript
import { getAirportCode, getSmartDepartureDate, getSmartReturnDate } from '../utils/airportLookup';

const code = getAirportCode('Melbourne', 'Australia'); // 'MEL'
const departureDate = getSmartDepartureDate(); // 2 weeks from today
const returnDate = getSmartReturnDate(departureDate); // 1 week after departure
```

**Build flight search URL**:
```typescript
const buildSearchUrl = (offer: Destination) => {
  const params = new URLSearchParams({
    tripType: 'return',
    from: 'ACC',
    to: getAirportCode(offer.name, offer.country),
    departureDate: getSmartDepartureDate(),
    returnDate: getSmartReturnDate(getSmartDepartureDate()),
    adults: '1',
    travelClass: 'ECONOMY',
    offerId: offer.id,
    suggestedPrice: offer.price.toString()
  });
  return `/flights?${params.toString()}`;
};
```

---

## API Endpoints Reference

### Admin Endpoints (All require admin auth)

```bash
# Bookings
GET    /api/admin/bookings?status=pending&limit=50
PATCH  /api/admin/bookings/:id { status: 'confirmed' }
POST   /api/admin/bookings/:id/refund
DELETE /api/admin/bookings/:id

# Users
GET    /api/admin/users
PATCH  /api/admin/users/:id/admin { isAdmin: true }
PATCH  /api/admin/users/:id/disable { disabled: true }

# Universities
GET    /api/admin/universities?country=USA&featured=true
POST   /api/admin/universities { name, country, ... }
PATCH  /api/admin/universities/:id { ranking: 10 }
PATCH  /api/admin/universities/:id/featured { featured: true }

# Applications
GET    /api/admin/applications?status=submitted
PATCH  /api/admin/applications/:id/status { status: 'accepted' }
POST   /api/admin/applications/:id/notes { note: 'Great student' }

# Analytics
GET    /api/admin/analytics/revenue?startDate=2025-01-01&endDate=2025-12-31
GET    /api/admin/analytics/bookings
GET    /api/admin/analytics/routes

# Export
POST   /api/admin/export/bookings { format: 'csv' }
POST   /api/admin/export/applications { format: 'excel' }
```

---

## Common Components

### DataTable Usage

```typescript
import DataTable from '../../components/admin/DataTable';

const columns = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  {
    key: 'status',
    label: 'Status',
    render: (value) => <StatusBadge status={value} />
  },
  {
    key: 'actions',
    label: 'Actions',
    render: (_, row) => (
      <ActionMenu items={[
        { label: 'Edit', onClick: () => handleEdit(row) },
        { label: 'Delete', onClick: () => handleDelete(row.id), danger: true }
      ]} />
    )
  }
];

<DataTable
  data={items}
  columns={columns}
  loading={loading}
  onRowClick={(row) => console.log(row)}
/>
```

### FormModal Usage

```typescript
import FormModal from '../../components/admin/FormModal';

<FormModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Add University"
  initialData={selectedItem}
  onSubmit={handleSubmit}
/>
```

### ExportButton Usage

```typescript
import ExportButton from '../../components/admin/ExportButton';

<ExportButton
  data={bookings}
  filename="bookings"
  formats={['csv', 'excel', 'pdf']}
/>
```

---

## Firestore Security Rules

**Quick template**:
```javascript
match /collection/{docId} {
  // Public read
  allow read: if true;

  // Admin write
  allow write: if isAdmin();

  // User read their own
  allow read: if request.auth.uid == resource.data.userId;

  // User create their own
  allow create: if request.auth.uid == request.resource.data.userId;
}

function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

---

## Environment Variables Checklist

```bash
# .env file
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-admin-sdk.json
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourapp.com
AMADEUS_API_KEY=xxxxx
AMADEUS_API_SECRET=xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

---

## Testing Commands

**Backend tests**:
```bash
# Test admin authentication
curl -H "Authorization: Bearer {token}" http://localhost:3000/api/admin/bookings

# Test email service
node server/test-email.js
```

**Frontend tests**:
```bash
# Test guest booking flow
npm run dev
# 1. Browse to /offers
# 2. Click "Book Now"
# 3. Fill form as guest
# 4. Verify auth modal at payment

# Test admin panel
# 1. Login as admin
# 2. Navigate to /admin
# 3. Verify access granted
```

**Firestore rules test**:
```bash
firebase emulators:start --only firestore
npm run test:rules
```

---

## Debugging Tips

**Check Custom Claims**:
```typescript
// Frontend
const user = auth.currentUser;
const token = await user.getIdTokenResult(true); // Force refresh
console.log('Claims:', token.claims);
```

**Check Firestore data**:
```javascript
// Backend
const doc = await db.collection('users').doc(uid).get();
console.log('User data:', doc.data());
```

**Test admin middleware**:
```javascript
// Add logging to middleware
console.log('Decoded token:', decodedToken);
console.log('Admin claim:', decodedToken.admin);
```

---

## Migration Scripts

**Run data migration**:
```bash
cd server
node scripts/migrateData.js
```

**Manual migration**:
```javascript
// One-off script
const { db } = require('./utils/firebaseAdmin');

async function migrateOffers() {
  const offers = require('./data/mockData').specialOffers;

  for (const offer of offers) {
    await db.collection('specialOffers').doc(offer.id).set({
      ...offer,
      isActive: true,
      createdAt: new Date()
    });
  }
}

migrateOffers();
```

---

## Common Issues & Solutions

**Issue**: Admin claim not updating
**Solution**: Force token refresh
```typescript
await currentUser.getIdToken(true); // Force refresh
await refreshAdminStatus();
```

**Issue**: CORS errors on admin API
**Solution**: Add CORS middleware
```javascript
app.use(cors({ origin: process.env.FRONTEND_URL }));
```

**Issue**: Session storage not persisting
**Solution**: Check expiry logic
```typescript
const hoursSince = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
if (hoursSince > 24) { /* expired */ }
```

**Issue**: Email not sending
**Solution**: Check SendGrid API key
```bash
curl -H "Authorization: Bearer $SENDGRID_API_KEY" https://api.sendgrid.com/v3/stats
```

---

## Performance Tips

**Firestore queries**:
- Use indexes for compound queries
- Limit results with `.limit(50)`
- Use pagination with `.offset()`

**Admin dashboard**:
- Lazy load admin pages
- Cache analytics data
- Use DataTable pagination

**Guest booking**:
- Debounce form auto-save
- Clear old session storage entries
- Use React.memo for expensive components

---

## Deployment Checklist

- [ ] Set all environment variables
- [ ] Run data migration
- [ ] Update Firestore security rules
- [ ] Deploy backend to hosting
- [ ] Deploy frontend build
- [ ] Create first admin user
- [ ] Test admin panel access
- [ ] Test guest booking flow
- [ ] Test email notifications
- [ ] Verify CORS configuration

---

**Full Documentation**: See `IMPLEMENTATION_PLAN.md`
**Detailed Plan**: See `C:\Users\CRAFT\.claude\plans\lucky-mapping-ember.md`
