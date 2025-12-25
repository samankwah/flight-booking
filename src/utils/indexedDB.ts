// src/utils/indexedDB.ts

import type {
  FlightResult,
  PassengerDetails,
  SeatDetails,
  PaymentInfo,
  FlightSearchParams,
  HotelSearchParams,
} from '../types';

/**
 * IndexedDB Utility for Offline Data Storage
 *
 * Provides structured offline storage for:
 * - Booking drafts
 * - Search history
 * - User preferences
 * - Cached flight data
 */

const DB_NAME = 'FlightBookingDB';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  BOOKING_DRAFTS: 'bookingDrafts',
  SEARCH_HISTORY: 'searchHistory',
  FLIGHT_CACHE: 'flightCache',
  SYNC_QUEUE: 'syncQueue',
  USER_PREFERENCES: 'userPreferences',
} as const;

export interface BookingDraft {
  id: string;
  userId: string;
  flightId: string;
  flightDetails: FlightResult;
  passengers: PassengerDetails[];
  selectedSeats?: SeatDetails[];
  paymentInfo?: PaymentInfo;
  timestamp: number;
  status: 'draft' | 'pending' | 'synced';
}

export interface SearchHistoryItem {
  id: string;
  userId?: string;
  searchParams: FlightSearchParams | HotelSearchParams;
  timestamp: number;
}

// Union type for sync queue data - different types of data that can be synced
type SyncQueueData =
  | BookingDraft
  | { targetPrice: number; route: unknown } // Price alert data
  | { key: string; value: unknown } // User preference data
  | PaymentInfo; // Payment data

export interface SyncQueueItem {
  id: string;
  type: 'booking' | 'price-alert' | 'preference' | 'payment';
  action: 'create' | 'update' | 'delete';
  data: SyncQueueData;
  timestamp: number;
  retryCount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Initialize IndexedDB
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Error opening database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[IndexedDB] Database opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('[IndexedDB] Upgrading database schema...');

      // Create booking drafts store
      if (!db.objectStoreNames.contains(STORES.BOOKING_DRAFTS)) {
        const bookingStore = db.createObjectStore(STORES.BOOKING_DRAFTS, { keyPath: 'id' });
        bookingStore.createIndex('userId', 'userId', { unique: false });
        bookingStore.createIndex('status', 'status', { unique: false });
        bookingStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[IndexedDB] Created bookingDrafts store');
      }

      // Create search history store
      if (!db.objectStoreNames.contains(STORES.SEARCH_HISTORY)) {
        const searchStore = db.createObjectStore(STORES.SEARCH_HISTORY, { keyPath: 'id' });
        searchStore.createIndex('userId', 'userId', { unique: false });
        searchStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[IndexedDB] Created searchHistory store');
      }

      // Create flight cache store
      if (!db.objectStoreNames.contains(STORES.FLIGHT_CACHE)) {
        const flightStore = db.createObjectStore(STORES.FLIGHT_CACHE, { keyPath: 'id' });
        flightStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[IndexedDB] Created flightCache store');
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('status', 'status', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        console.log('[IndexedDB] Created syncQueue store');
      }

      // Create user preferences store
      if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
        const prefStore = db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' });
        console.log('[IndexedDB] Created userPreferences store');
      }

      console.log('[IndexedDB] Database upgrade completed');
    };
  });
};

/**
 * Generic get operation
 */
export const get = async <T>(storeName: string, key: string): Promise<T | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Error getting from ${storeName}:`, error);
    return null;
  }
};

/**
 * Generic getAll operation
 */
export const getAll = async <T>(storeName: string): Promise<T[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Error getting all from ${storeName}:`, error);
    return [];
  }
};

/**
 * Generic put operation (add or update)
 */
export const put = async <T>(storeName: string, data: T): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log(`[IndexedDB] Successfully saved to ${storeName}`);
        resolve(true);
      };
      request.onerror = () => {
        console.error(`[IndexedDB] Error saving to ${storeName}:`, request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error(`[IndexedDB] Error in put operation:`, error);
    return false;
  }
};

/**
 * Generic delete operation
 */
export const remove = async (storeName: string, key: string): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log(`[IndexedDB] Successfully deleted from ${storeName}`);
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Error deleting from ${storeName}:`, error);
    return false;
  }
};

/**
 * Query by index
 */
export const getByIndex = async <T>(
  storeName: string,
  indexName: string,
  value: any
): Promise<T[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Error querying by index:`, error);
    return [];
  }
};

/**
 * Clear entire store
 */
export const clearStore = async (storeName: string): Promise<boolean> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log(`[IndexedDB] Cleared store ${storeName}`);
        resolve(true);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Error clearing store:`, error);
    return false;
  }
};

/**
 * Count items in store
 */
export const count = async (storeName: string): Promise<number> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.count();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Error counting:`, error);
    return 0;
  }
};

/**
 * Delete old items from store based on timestamp
 */
export const deleteOldItems = async (
  storeName: string,
  maxAge: number // in milliseconds
): Promise<number> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const index = store.index('timestamp');
    const cutoffTime = Date.now() - maxAge;

    const request = index.openCursor();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result as IDBCursorWithValue;
        if (cursor) {
          if (cursor.value.timestamp < cutoffTime) {
            cursor.delete();
            deletedCount++;
          }
          cursor.continue();
        } else {
          console.log(`[IndexedDB] Deleted ${deletedCount} old items from ${storeName}`);
          resolve(deletedCount);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error(`[IndexedDB] Error deleting old items:`, error);
    return 0;
  }
};

// Export convenience methods for specific stores

/**
 * Booking Drafts Operations
 */
export const bookingDrafts = {
  save: (draft: BookingDraft) => put(STORES.BOOKING_DRAFTS, draft),
  get: (id: string) => get<BookingDraft>(STORES.BOOKING_DRAFTS, id),
  getAll: () => getAll<BookingDraft>(STORES.BOOKING_DRAFTS),
  getByUser: (userId: string) => getByIndex<BookingDraft>(STORES.BOOKING_DRAFTS, 'userId', userId),
  getByStatus: (status: string) => getByIndex<BookingDraft>(STORES.BOOKING_DRAFTS, 'status', status),
  delete: (id: string) => remove(STORES.BOOKING_DRAFTS, id),
  clear: () => clearStore(STORES.BOOKING_DRAFTS),
  count: () => count(STORES.BOOKING_DRAFTS),
};

/**
 * Search History Operations
 */
export const searchHistory = {
  save: (search: SearchHistoryItem) => put(STORES.SEARCH_HISTORY, search),
  getAll: () => getAll<SearchHistoryItem>(STORES.SEARCH_HISTORY),
  getByUser: (userId: string) => getByIndex<SearchHistoryItem>(STORES.SEARCH_HISTORY, 'userId', userId),
  delete: (id: string) => remove(STORES.SEARCH_HISTORY, id),
  clear: () => clearStore(STORES.SEARCH_HISTORY),
  deleteOld: (maxAge: number) => deleteOldItems(STORES.SEARCH_HISTORY, maxAge),
};

/**
 * Sync Queue Operations
 */
export const syncQueue = {
  add: (item: SyncQueueItem) => put(STORES.SYNC_QUEUE, item),
  get: (id: string) => get<SyncQueueItem>(STORES.SYNC_QUEUE, id),
  getAll: () => getAll<SyncQueueItem>(STORES.SYNC_QUEUE),
  getPending: () => getByIndex<SyncQueueItem>(STORES.SYNC_QUEUE, 'status', 'pending'),
  update: (item: SyncQueueItem) => put(STORES.SYNC_QUEUE, item),
  delete: (id: string) => remove(STORES.SYNC_QUEUE, id),
  clear: () => clearStore(STORES.SYNC_QUEUE),
  count: () => count(STORES.SYNC_QUEUE),
};

/**
 * User Preferences Operations
 */
export const userPreferences = {
  set: (key: string, value: any) => put(STORES.USER_PREFERENCES, { key, value, timestamp: Date.now() }),
  get: async (key: string): Promise<any> => {
    const result = await get<{ key: string; value: any }>(STORES.USER_PREFERENCES, key);
    return result?.value || null;
  },
  delete: (key: string) => remove(STORES.USER_PREFERENCES, key),
  clear: () => clearStore(STORES.USER_PREFERENCES),
};

/**
 * Initialize database on import
 */
if (typeof window !== 'undefined' && 'indexedDB' in window) {
  initDB().catch((error) => {
    console.error('[IndexedDB] Failed to initialize database:', error);
  });
}

export default {
  initDB,
  get,
  getAll,
  put,
  remove,
  getByIndex,
  clearStore,
  count,
  deleteOldItems,
  bookingDrafts,
  searchHistory,
  syncQueue,
  userPreferences,
};
