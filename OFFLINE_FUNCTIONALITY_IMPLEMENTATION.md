# Offline Functionality Implementation Guide

## Overview

This guide covers the complete implementation of offline functionality in the flight booking application, including IndexedDB storage, background sync, and offline booking drafts.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [IndexedDB Structure](#indexeddb-structure)
3. [Offline Booking System](#offline-booking-system)
4. [Background Sync](#background-sync)
5. [Usage Guide](#usage-guide)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)
8. [Browser Compatibility](#browser-compatibility)

---

## Architecture Overview

### System Components

```
┌─────────────────┐
│   User Action   │
│  (Create Booking│
│   /Price Alert) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      Online?      ┌─────────────────┐
│  Check Network  │────────Yes───────►│   API Request   │
│     Status      │                   │   (Immediate)   │
└────────┬────────┘                   └─────────────────┘
         │
         No
         │
         ▼
┌─────────────────┐
│  Save to        │
│  IndexedDB      │
│  (Draft)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Add to Sync    │
│     Queue       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Register       │
│  Background     │
│  Sync          │
└────────┬────────┘
         │
         │ When Online
         ▼
┌─────────────────┐
│  Service Worker │
│  Background     │
│  Sync           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Update API     │
│  Mark as Synced │
└─────────────────┘
```

### Technology Stack

- **IndexedDB**: Client-side structured data storage
- **Service Worker**: Background sync and offline handling
- **Background Sync API**: Retry failed requests when online
- **TypeScript**: Type-safe offline utilities
- **React**: UI components for offline indicators

---

## IndexedDB Structure

### Database Schema

**Database Name**: `FlightBookingDB`
**Version**: 1

### Object Stores

#### 1. `bookingDrafts`

Stores booking drafts created while offline.

```typescript
interface BookingDraft {
  id: string;              // UUID
  userId: string;          // User identifier
  flightId: string;        // Flight identifier
  flightDetails: any;      // Complete flight information
  passengers: any[];       // Passenger details
  selectedSeats?: any[];   // Seat selections
  paymentInfo?: any;       // Payment details (if provided)
  timestamp: number;       // Creation time (ms)
  status: 'draft' | 'pending' | 'synced';
}
```

**Indexes:**
- `userId` - Find drafts by user
- `status` - Filter by status
- `timestamp` - Sort by time

#### 2. `searchHistory`

Stores recent flight searches for offline access.

```typescript
interface SearchHistoryItem {
  id: string;              // UUID
  userId?: string;         // User identifier (optional for guests)
  searchParams: any;       // Search parameters
  timestamp: number;       // Search time (ms)
}
```

**Indexes:**
- `userId` - Find searches by user
- `timestamp` - Sort by time

#### 3. `syncQueue`

Queue for actions that need to sync when online.

```typescript
interface SyncQueueItem {
  id: string;                                    // UUID
  type: 'booking' | 'price-alert' | 'preference' | 'payment';
  action: 'create' | 'update' | 'delete';
  data: any;                                     // Action data
  timestamp: number;                             // Creation time (ms)
  retryCount: number;                            // Retry attempts
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
```

**Indexes:**
- `status` - Filter by status
- `type` - Filter by action type
- `timestamp` - Sort by time

#### 4. `flightCache`

Cached flight data for offline viewing.

```typescript
interface FlightCacheItem {
  id: string;              // Cache key
  data: any;              // Cached flight data
  timestamp: number;       // Cache time (ms)
}
```

**Indexes:**
- `timestamp` - Find old cache entries

#### 5. `userPreferences`

User preferences and settings.

```typescript
interface UserPreference {
  key: string;             // Preference key
  value: any;             // Preference value
  timestamp: number;       // Last updated (ms)
}
```

**No indexes** - Uses key as primary key

---

## Offline Booking System

### Saving Booking Drafts

```typescript
import { saveBookingDraft } from '../utils/offlineBooking';

// Save a booking draft while offline
const draftId = await saveBookingDraft(userId, {
  flightId: 'FL123',
  flightDetails: {
    origin: 'JFK',
    destination: 'LAX',
    departureDate: '2025-07-15',
    price: 320,
  },
  passengers: [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
  ],
  selectedSeats: ['12A'],
});

console.log('Draft saved:', draftId);
```

### Queueing for Sync

```typescript
import { queueBookingForSync } from '../utils/offlineBooking';

// Queue booking for sync when online
const queueId = await queueBookingForSync(bookingData, userId);

// Automatically triggers background sync if supported
```

### Retrieving Drafts

```typescript
import { getUserBookingDrafts, getBookingDraft } from '../utils/offlineBooking';

// Get all drafts for a user
const drafts = await getUserBookingDrafts(userId);

// Get specific draft
const draft = await getBookingDraft(draftId);
```

### Updating Drafts

```typescript
import { updateBookingDraft } from '../utils/offlineBooking';

// Update an existing draft
await updateBookingDraft(draftId, {
  selectedSeats: ['12A', '12B'],
  status: 'pending',
});
```

### Draft Statistics

```typescript
import { getDraftStats } from '../utils/offlineBooking';

const stats = await getDraftStats(userId);
console.log(stats);
// {
//   total: 5,
//   drafts: 2,    // Unsaved drafts
//   pending: 2,   // Queued for sync
//   synced: 1     // Successfully synced
// }
```

---

## Background Sync

### How Background Sync Works

1. **Offline Action**: User performs an action (e.g., creates booking)
2. **Queue Item**: Action is added to sync queue in IndexedDB
3. **Register Sync**: Service worker registers a sync event
4. **Wait for Online**: Browser waits for network connection
5. **Sync Event**: Service worker receives sync event when online
6. **Process Queue**: Service worker syncs all pending items
7. **Update Status**: Items marked as completed or failed

### Service Worker Sync Handler

The service worker automatically handles background sync:

```javascript
// In service worker (public/sw.js)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookings') {
    event.waitUntil(syncPendingItems('booking'));
  } else if (event.tag === 'sync-all') {
    event.waitUntil(syncPendingItems());
  }
});
```

### Manual Sync

```typescript
import { syncAll, getSyncStatus } from '../utils/syncManager';

// Check sync status
const status = await getSyncStatus();
console.log(status);
// { pending: 3, processing: 0, completed: 10, failed: 1 }

// Manually trigger sync
const result = await syncAll();
console.log(result);
// {
//   total: 3,
//   successful: 2,
//   failed: 1,
//   results: [...]
// }
```

### Auto-Sync on Network Restore

The sync manager automatically syncs when connection is restored:

```typescript
// Initialized in main.tsx
import { setupAutoSync } from './utils/syncManager';

setupAutoSync();
// - Syncs when coming online
// - Periodic sync check every 5 minutes
```

### Retry Failed Sync

```typescript
import { retryFailed } from '../utils/syncManager';

// Retry all failed sync items
const results = await retryFailed();
console.log(`Retried ${results.length} failed items`);
```

---

## Usage Guide

### Complete Offline Booking Flow

```typescript
import { useAuth } from '../contexts/AuthContext';
import { saveBookingDraft, queueBookingForSync } from '../utils/offlineBooking';

const BookingComponent = () => {
  const { user } = useAuth();
  const [isOnline] = useState(navigator.onLine);

  const handleBooking = async (bookingData) => {
    try {
      if (isOnline) {
        // Online: Submit directly to API
        const response = await fetch('/api/bookings', {
          method: 'POST',
          body: JSON.stringify(bookingData),
        });

        if (response.ok) {
          alert('Booking confirmed!');
        }
      } else {
        // Offline: Save draft and queue for sync
        const queueId = await queueBookingForSync(bookingData, user.uid);

        alert('Booking saved! Will sync when you\'re back online.');
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  return (
    <div>
      {!isOnline && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          ⚠️ You're offline. Booking will be saved and synced when online.
        </div>
      )}

      <button onClick={handleBooking}>
        {isOnline ? 'Book Now' : 'Save Booking (Offline)'}
      </button>
    </div>
  );
};
```

### Viewing Saved Drafts

```typescript
import { getUserBookingDrafts } from '../utils/offlineBooking';

const SavedDraftsPage = () => {
  const { user } = useAuth();
  const [drafts, setDrafts] = useState([]);

  useEffect(() => {
    const loadDrafts = async () => {
      const userDrafts = await getUserBookingDrafts(user.uid);
      setDrafts(userDrafts);
    };

    loadDrafts();
  }, [user]);

  return (
    <div>
      <h2>Saved Booking Drafts</h2>

      {drafts.map((draft) => (
        <div key={draft.id} className="draft-card">
          <h3>{draft.flightDetails.origin} → {draft.flightDetails.destination}</h3>
          <p>Status: {draft.status}</p>
          <p>Saved: {new Date(draft.timestamp).toLocaleString()}</p>

          <button onClick={() => continueDraft(draft.id)}>
            Continue Booking
          </button>
        </div>
      ))}
    </div>
  );
};
```

### Offline Indicator Component

The application includes an `OfflineIndicator` component that shows:
- Online/offline status
- Number of pending sync items
- Manual sync button
- Sync progress

```typescript
// Already included in App.tsx
import { OfflineIndicator } from './components/OfflineIndicator';

<OfflineIndicator />
```

**Features:**
- ✅ Visual online/offline indicator
- ✅ Pending items counter
- ✅ Expandable sync status details
- ✅ Manual sync trigger
- ✅ Auto-sync on network restore
- ✅ Last sync timestamp

---

## Testing

### Testing Offline Functionality

#### 1. Simulate Offline Mode

**Chrome DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Select "Offline" from throttling dropdown
4. Or check "Offline" checkbox

**Firefox DevTools:**
1. Open DevTools (F12)
2. Go to Network tab
3. Click "No Throttling" dropdown
4. Select "Offline"

#### 2. Test Offline Booking

1. Go to booking page
2. Fill in booking details
3. Enable offline mode in DevTools
4. Click "Book Now"
5. Check IndexedDB:
   - DevTools → Application → IndexedDB
   - Verify draft saved in `bookingDrafts`
   - Verify item in `syncQueue`

#### 3. Test Background Sync

1. With items in sync queue
2. Re-enable network in DevTools
3. Check Console for sync messages
4. Verify items marked as completed in IndexedDB

#### 4. Test Service Worker Sync

```javascript
// In browser console
navigator.serviceWorker.ready.then((registration) => {
  return registration.sync.register('sync-all');
});
```

### Testing IndexedDB Operations

```javascript
// Open browser console

// Import utilities
import { bookingDrafts, syncQueue } from './utils/indexedDB';

// Test save
await bookingDrafts.save({
  id: 'test-123',
  userId: 'user-456',
  flightId: 'FL789',
  flightDetails: { /* ... */ },
  passengers: [],
  timestamp: Date.now(),
  status: 'draft',
});

// Test retrieve
const drafts = await bookingDrafts.getAll();
console.log('All drafts:', drafts);

// Test queue
const pending = await syncQueue.getPending();
console.log('Pending sync items:', pending);
```

### Manual Testing Checklist

- [ ] Create booking while offline
- [ ] Draft saved to IndexedDB
- [ ] Item added to sync queue
- [ ] Offline indicator shows pending items
- [ ] Connection restored triggers auto-sync
- [ ] Items synced successfully
- [ ] Drafts marked as synced
- [ ] Manual sync button works
- [ ] Retry failed items works
- [ ] Old drafts cleaned up after 7 days

---

## Troubleshooting

### Common Issues

#### 1. IndexedDB Not Initializing

**Symptoms:**
- Errors about missing object stores
- "Database not found" errors

**Solutions:**
```typescript
// Check if IndexedDB is supported
if ('indexedDB' in window) {
  console.log('IndexedDB supported');
} else {
  console.error('IndexedDB not supported');
}

// Manually initialize
import { initDB } from './utils/indexedDB';

try {
  const db = await initDB();
  console.log('DB initialized:', db);
} catch (error) {
  console.error('DB init failed:', error);
}
```

#### 2. Background Sync Not Working

**Symptoms:**
- Items stay in pending state
- No sync when coming online

**Solutions:**

1. **Check browser support:**
```javascript
if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
  console.log('Background Sync supported');
} else {
  console.log('Background Sync not supported - will use manual sync');
}
```

2. **Manually trigger sync:**
```typescript
import { syncAll } from './utils/syncManager';
await syncAll();
```

3. **Check service worker registration:**
```javascript
navigator.serviceWorker.getRegistration().then((reg) => {
  console.log('Service Worker:', reg);
  if (reg) {
    reg.sync.register('sync-all');
  }
});
```

#### 3. Drafts Not Syncing

**Symptoms:**
- Drafts stay in pending state
- Sync completes but drafts not updated

**Possible Causes:**
- Auth token missing or expired
- API endpoint errors
- Network connectivity issues

**Debug:**
```typescript
import { syncQueue } from './utils/indexedDB';

// Check pending items
const pending = await syncQueue.getPending();
console.log('Pending items:', pending);

// Check for errors
const failed = await syncQueue.getByIndex('status', 'failed');
console.log('Failed items:', failed);

// Check item details
if (failed.length > 0) {
  console.log('Last error:', failed[0].lastError);
  console.log('Retry count:', failed[0].retryCount);
}
```

#### 4. "QuotaExceededError"

**Symptoms:**
- Can't save to IndexedDB
- Storage quota exceeded

**Solutions:**

1. **Check storage quota:**
```javascript
if (navigator.storage && navigator.storage.estimate) {
  navigator.storage.estimate().then((estimate) => {
    console.log('Used:', estimate.usage);
    console.log('Quota:', estimate.quota);
    console.log('Percentage:', (estimate.usage / estimate.quota * 100).toFixed(2) + '%');
  });
}
```

2. **Clear old data:**
```typescript
import { clearOldSyncedDrafts } from './utils/offlineBooking';
import { clearCompleted } from './utils/syncManager';

// Clear old drafts (>7 days)
await clearOldSyncedDrafts();

// Clear completed sync items
await clearCompleted();
```

3. **Request persistent storage:**
```javascript
if (navigator.storage && navigator.storage.persist) {
  navigator.storage.persist().then((persistent) => {
    if (persistent) {
      console.log('Storage will not be cleared except by explicit user action');
    } else {
      console.log('Storage may be cleared by the UA under storage pressure');
    }
  });
}
```

---

## Browser Compatibility

### Feature Support Matrix

| Feature | Chrome | Firefox | Safari | Edge | iOS Safari |
|---------|--------|---------|--------|------|------------|
| IndexedDB | 24+ | 16+ | 10+ | 12+ | 10+ |
| Service Workers | 40+ | 44+ | 11.1+ | 17+ | 11.3+ |
| Background Sync | 49+ | ❌ | ❌ | 79+ | ❌ |
| Promise-based IDB | 58+ | 58+ | 11+ | 79+ | 11+ |

### Polyfills and Fallbacks

**Background Sync Fallback:**

When Background Sync API is not available, the app falls back to:
1. **Auto-sync on network restore**: Window online event
2. **Periodic sync check**: Every 5 minutes when online
3. **Manual sync button**: User-triggered sync

**IndexedDB Fallback:**

If IndexedDB is not available (very rare):
- Use localStorage for small amounts of data
- Disable offline booking features
- Show appropriate error messages

### Progressive Enhancement

The offline functionality is implemented with progressive enhancement:

```typescript
// Check feature support
const hasIndexedDB = 'indexedDB' in window;
const hasServiceWorker = 'serviceWorker' in navigator;
const hasBackgroundSync = hasServiceWorker &&
  'sync' in ServiceWorkerRegistration.prototype;

// Enable features based on support
if (hasIndexedDB) {
  // Enable offline drafts
  initDB();
}

if (hasBackgroundSync) {
  // Enable automatic background sync
  setupBackgroundSync();
} else {
  // Use manual sync only
  setupManualSync();
}
```

---

## API Reference

### IndexedDB Utilities

#### `initDB()`
Initialize the IndexedDB database.
```typescript
const db = await initDB();
```

#### `bookingDrafts.save(draft)`
Save a booking draft.
```typescript
await bookingDrafts.save(draftObject);
```

#### `bookingDrafts.getByUser(userId)`
Get all drafts for a user.
```typescript
const drafts = await bookingDrafts.getByUser('user-123');
```

#### `syncQueue.add(item)`
Add item to sync queue.
```typescript
await syncQueue.add(queueItem);
```

#### `syncQueue.getPending()`
Get all pending sync items.
```typescript
const pending = await syncQueue.getPending();
```

### Offline Booking

#### `saveBookingDraft(userId, bookingData)`
Save booking draft.
```typescript
const draftId = await saveBookingDraft(userId, bookingData);
```

#### `queueBookingForSync(bookingData, userId)`
Queue booking for sync.
```typescript
const queueId = await queueBookingForSync(bookingData, userId);
```

#### `getUserBookingDrafts(userId)`
Get user's drafts.
```typescript
const drafts = await getUserBookingDrafts(userId);
```

### Sync Manager

#### `syncAll()`
Sync all pending items.
```typescript
const result = await syncAll();
```

#### `getSyncStatus()`
Get sync status.
```typescript
const status = await getSyncStatus();
```

#### `setupAutoSync()`
Initialize auto-sync.
```typescript
setupAutoSync();
```

#### `retryFailed()`
Retry failed items.
```typescript
const results = await retryFailed();
```

---

## Performance Considerations

### IndexedDB Performance

**Best Practices:**
- ✅ Use indexes for frequent queries
- ✅ Batch operations when possible
- ✅ Use transactions appropriately
- ✅ Clean up old data regularly
- ✅ Limit stored data size

**Optimization Tips:**
```typescript
// Good: Single transaction for multiple operations
const transaction = db.transaction(['bookingDrafts'], 'readwrite');
const store = transaction.objectStore('bookingDrafts');
await store.put(draft1);
await store.put(draft2);
await store.put(draft3);

// Bad: Multiple transactions
await bookingDrafts.save(draft1);
await bookingDrafts.save(draft2);
await bookingDrafts.save(draft3);
```

### Sync Performance

**Throttling:**
- Sync items sequentially to avoid overwhelming API
- 200ms delay between sync operations
- Max 3 retry attempts per item

**Data Limits:**
- Booking drafts: Keep last 30 days only
- Sync queue: Auto-delete completed items after 24h
- Search history: Keep last 100 searches

---

## Summary

Your offline functionality is now fully implemented with:

✅ **IndexedDB Storage**
- 5 object stores for different data types
- Indexed queries for performance
- Type-safe operations

✅ **Offline Booking System**
- Save booking drafts while offline
- Queue items for sync
- Automatic sync when online
- Draft management

✅ **Background Sync**
- Service worker sync handlers
- Automatic retry logic (3 attempts)
- Manual sync trigger
- Sync status tracking

✅ **User Interface**
- Offline indicator component
- Sync status display
- Manual sync button
- Real-time status updates

✅ **Production Ready**
- Browser compatibility handled
- Fallbacks for unsupported features
- Error handling and retry logic
- Performance optimizations

### Quick Start

1. **Check IndexedDB console:**
   DevTools → Application → IndexedDB → FlightBookingDB

2. **Test offline mode:**
   DevTools → Network → Offline

3. **Create booking offline:**
   Fill form → Submit → Check IndexedDB

4. **Restore connection:**
   Network → Online → Watch sync complete

5. **View sync status:**
   Click offline indicator → See pending items

For support or questions, refer to the API Reference section above.
