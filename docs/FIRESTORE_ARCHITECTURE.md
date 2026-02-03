# Firestore Architecture Documentation

## Overview

This document describes the Firebase Firestore database architecture for the Flight Booking application, including collection structures, data relationships, and design decisions.

## Database Structure

### Collections Overview

The application uses 14 primary Firestore collections:

| Collection | Purpose | Key Features |
|-----------|---------|--------------|
| `bookings` | Flight bookings | Payment status, booking workflow |
| `hotelBookings` | Hotel reservations | Check-in/out dates, room details |
| `holidayPackageBookings` | Holiday packages | Multi-traveler support, insurance |
| `visaApplications` | Visa applications | Document tracking, approval workflow |
| `applications` | Study abroad applications | Complex workflow, document verification |
| `studyAbroadApplications` | Legacy study abroad | Consultant assignment, inquiry tracking |
| `universities` | University profiles | Rankings, accreditation, featured status |
| `studyAbroadPrograms` | Academic programs | Tuition, scholarships, requirements |
| `priceAlerts` | Price monitoring | Email notifications, route tracking |
| `notification-subscriptions` | Push notifications | Browser subscriptions, device management |
| `notification-preferences` | User preferences | Email, SMS, push settings |
| `specialOffers` | Marketing offers | Redemption tracking, validity periods |
| `topDeals` | Featured deals | Click tracking, conversion analytics |
| `users` | User profiles | Admin status, authentication metadata |

---

## Collection Details

### 1. Bookings Collection (`bookings`)

**Purpose:** Flight booking records with payment and status tracking

**Key Fields:**
```typescript
{
  id: string;                    // Firestore document ID
  userId: string;                // User who made the booking
  flightDetails: {
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    duration: number;             // Minutes
    stops: number;
    cabinClass: 'economy' | 'business' | 'first';
  };
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    passportNumber: string;
  };
  totalPrice: number;
  currency: string;               // ISO 4217 code (USD, GHS, etc.)
  status: BookingStatus;          // pending | confirmed | cancelled | completed | refunded
  paymentStatus: PaymentStatus;   // pending | paid | failed | refunded
  paymentMethod?: string;
  paymentReference?: string;
  bookingReference: string;       // Unique booking identifier
  bookingDate: string;            // ISO 8601 timestamp
  createdAt: string;
  updatedAt: string;
}
```

**Indexes:**
- `(userId, bookingDate DESC)` - User booking history
- `(status, bookingDate DESC)` - Admin filtering by status
- `(paymentStatus, bookingDate DESC)` - Payment tracking
- `(bookingDate ASC, status ASC)` - Date range queries

**Security Rules:**
- Users can only create bookings with their own `userId`
- Users can only read their own bookings
- Admins can read/update all bookings
- Financial fields (`totalPrice`, `currency`) cannot be modified after payment

---

### 2. Hotel Bookings Collection (`hotelBookings`)

**Purpose:** Hotel reservation management

**Key Fields:**
```typescript
{
  id: string;
  userId: string;
  hotelDetails: {
    hotelName: string;
    location: string;
    roomType: string;
    amenities: string[];
  };
  bookingDates: {
    checkIn: string;              // YYYY-MM-DD
    checkOut: string;             // YYYY-MM-DD
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  totalPrice: number;
  currency: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  confirmationNumber?: string;
  bookingDate: string;
  createdAt: string;
  updatedAt: string;
}
```

**Business Logic:**
- Cancellation allowed up to 48 hours before check-in
- Automatic status updates based on dates

---

### 3. Universities Collection (`universities`)

**Purpose:** University profile and program information

**Key Fields:**
```typescript
{
  id: string;
  basicInfo: {
    name: string;
    country: string;
    city: string;
    address: string;
    website: string;
    email: string;
    phone: string;
    slug: string;                 // URL-friendly identifier
  };
  academics: {
    ranking: {
      world: number;
      national: number;
      source: string;
      year: number;
    };
    accreditations: string[];
    totalStudents: number;
    internationalStudents: number;
    facultyCount: number;
    studentFacultyRatio: string;
  };
  settings: {
    isActive: boolean;
    isFeatured: boolean;
    featuredPriority: number;
    tags: string[];
    createdAt: string;
    lastUpdated: string;
  };
}
```

**Indexes:**
- `(basicInfo.country ASC, settings.isFeatured ASC)` - Country filtering
- `(settings.isActive ASC, settings.createdAt DESC)` - Active universities

---

### 4. Applications Collection (`applications`)

**Purpose:** Study abroad application workflow management

**Key Fields:**
```typescript
{
  id: string;
  applicant: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    currentLocation: string;
  };
  university: {
    id: string;
    name: string;
    country: string;
  };
  program: {
    id: string;
    name: string;
    degree: string;
    field: string;
  };
  documents: {
    type: string;                 // transcript, essay, etc.
    name: string;
    url: string;
    uploadedAt: string;
    verifiedAt?: string;
    verifiedBy?: string;
  }[];
  workflow: {
    status: ApplicationStatus;    // draft | submitted | under_review | accepted | rejected | waitlisted
    submittedAt?: string;
    reviewedAt?: string;
    completedAt?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assignedTo?: string;          // Admin user ID
    notes: string;
  };
  payment: {
    applicationFee: number;
    currency: string;
    paidAt?: string;
    paymentMethod?: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

**Workflow States:**
1. `draft` - Application being filled out
2. `submitted` - Application submitted by user
3. `under_review` - Admin reviewing application
4. `accepted` - Application accepted
5. `rejected` - Application rejected
6. `waitlisted` - Application waitlisted
7. `withdrawn` - User withdrew application

**Indexes:**
- `(applicant.userId ASC, workflow.submittedAt DESC)` - User applications
- `(workflow.status ASC, workflow.submittedAt DESC)` - Admin filtering
- `(workflow.priority ASC, workflow.submittedAt DESC)` - Priority queue
- `(university.id ASC, workflow.submittedAt DESC)` - University applications
- `(workflow.assignedTo ASC, workflow.submittedAt DESC)` - Assigned applications

---

## Data Relationships

### Primary Relationships

```
User (users)
  ├── Bookings (bookings)
  ├── Hotel Bookings (hotelBookings)
  ├── Holiday Bookings (holidayPackageBookings)
  ├── Visa Applications (visaApplications)
  ├── Study Abroad Applications (applications)
  ├── Price Alerts (priceAlerts)
  └── Notification Preferences (notification-preferences)

University (universities)
  ├── Programs (studyAbroadPrograms)
  └── Applications (applications)

Special Offers (specialOffers)
  └── Redemptions (embedded in document)

Top Deals (topDeals)
  └── Analytics (embedded in document)
```

**Note:** Firestore is a NoSQL database, so relationships are denormalized. Foreign keys are stored as strings, and joins are performed in application code.

---

## Design Decisions

### 1. Denormalization Strategy

**Decision:** Store user and university information in application documents

**Rationale:**
- Faster reads (no joins required)
- Simpler queries
- Better performance for dashboards

**Trade-off:**
- Data duplication
- Manual synchronization required when source data changes

### 2. Timestamp Format

**Decision:** Use ISO 8601 strings instead of Firestore Timestamps

**Rationale:**
- Consistent across all platforms
- Easier to serialize/deserialize
- Compatible with REST APIs

**Format:** `YYYY-MM-DDTHH:mm:ss.sssZ`

### 3. Status Enums

**Decision:** Use string literals for status values

**Rationale:**
- TypeScript type safety
- Zod schema validation
- Firestore security rules validation

**Example:**
```typescript
type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
```

### 4. Currency Handling

**Decision:** Store amounts as numbers with separate currency code

**Rationale:**
- Flexible multi-currency support
- Easy aggregation
- Standard practice

**Example:**
```typescript
{
  totalPrice: 850,
  currency: 'USD'
}
```

### 5. Document ID Strategy

**Decision:** Use Firestore auto-generated IDs, store in `id` field

**Rationale:**
- Guaranteed uniqueness
- No ID collision concerns
- Easy reference lookups

---

## Indexing Strategy

### Composite Indexes

All multi-field queries require composite indexes:

**Created Indexes:** 33 total

**Index Categories:**
1. **User queries** - `(userId ASC, timestamp DESC)`
2. **Status filtering** - `(status ASC, timestamp DESC)`
3. **Date range queries** - `(dateField ASC/DESC, status ASC)`
4. **Admin dashboards** - `(assignedTo ASC, priority ASC)`

**Index Build Time:** 30 minutes to 2 hours (production)

### Single-Field Indexes

Firestore automatically creates single-field indexes for:
- All top-level fields
- Can be used for simple queries

---

## Performance Optimization

### 1. Cursor-Based Pagination

**Implemented:** Yes
**Location:** `BaseService.ts` - `findPaginated()`

**Benefits:**
- Constant time complexity O(1)
- No offset scanning
- Works well with large datasets

**Example:**
```typescript
const result = await bookingService.findPaginated({
  where: [{ field: 'userId', operator: '==', value: userId }],
  orderBy: [{ field: 'bookingDate', direction: 'desc' }],
  limit: 20,
  startAfter: lastDocument
});
```

### 2. Query Optimization

**Avoided Patterns:**
- ❌ Fetching all documents then filtering in memory
- ❌ Offset-based pagination
- ❌ IN queries with > 10 items

**Preferred Patterns:**
- ✅ Firestore query filters
- ✅ Cursor-based pagination
- ✅ Indexed queries

---

## Security Considerations

### Authentication

- All operations require Firebase Authentication
- User ID verification on write operations
- Admin claims for privileged operations

### Authorization Rules

**Firestore Security Rules** (`firestore.rules`):
- Field-level validation
- Protected fields (userId, createdAt, financial data)
- Role-based access (user vs admin)
- Required field validation

**Example:**
```javascript
allow create: if isAuthenticated() &&
  request.resource.data.userId == request.auth.uid &&
  hasRequiredFields(['userId', 'flightDetails', 'passengerInfo']) &&
  request.resource.data.totalPrice > 0;
```

### Data Protection

- Financial data immutable after payment
- User data isolated (users can't access others' data)
- Admin operations logged
- Soft deletes (where applicable)

---

## Backup and Recovery

### Backup Strategy

**Frequency:** Daily automated backups
**Retention:** 30 days
**Method:** Firestore export to Cloud Storage

**Manual Backup:**
```bash
npm run backup-firestore
```

**Backup Location:** `./backups/backup-{timestamp}/`

### Recovery Process

1. Identify backup to restore
2. Review backup metadata
3. Use Firebase CLI to restore:
   ```bash
   firebase firestore:restore gs://backup-bucket/backup-{timestamp}
   ```

---

## Migration Path

### Current State
- 14 active collections
- ~33 composite indexes
- Enhanced security rules deployed

### Future Considerations

1. **Subcollections** - For large nested data (e.g., application documents)
2. **Sharding** - For high-write collections (e.g., analytics events)
3. **Cloud Functions** - For automated workflows
4. **Real-time Listeners** - For live updates

---

## Monitoring and Metrics

### Key Metrics

- Query latency (target: < 500ms p95)
- Document count per collection
- Index usage statistics
- Security rule denials

### Tools

- Firebase Console - Real-time monitoring
- Cloud Logging - Query logs
- Performance Monitoring - Client-side metrics

---

## References

- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)
