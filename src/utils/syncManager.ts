// src/utils/syncManager.ts

/**
 * Sync Manager
 *
 * Handles synchronization of offline actions when connection is restored
 */

import { syncQueue, bookingDrafts, type SyncQueueItem } from './indexedDB';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

interface SyncResult {
  success: boolean;
  itemId: string;
  error?: string;
}

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  try {
    const authData = localStorage.getItem('authToken');
    return authData ? JSON.parse(authData).token : null;
  } catch {
    return null;
  }
};

/**
 * Sync a single booking
 */
const syncBooking = async (item: SyncQueueItem): Promise<SyncResult> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Booking sync failed');
    }

    const result = await response.json();

    // Mark draft as synced if exists
    const drafts = await bookingDrafts.getByUser(item.data.userId);
    const matchingDraft = drafts.find(d => d.flightId === item.data.flightId);
    if (matchingDraft) {
      await bookingDrafts.save({
        ...matchingDraft,
        status: 'synced',
      });
    }

    console.log('[Sync Manager] Booking synced successfully:', item.id);
    return { success: true, itemId: item.id };
  } catch (error: any) {
    console.error('[Sync Manager] Booking sync failed:', error);
    return { success: false, itemId: item.id, error: error.message };
  }
};

/**
 * Sync a price alert
 */
const syncPriceAlert = async (item: SyncQueueItem): Promise<SyncResult> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    let url = `${API_BASE_URL}/api/price-alerts`;
    let method = 'POST';

    if (item.action === 'update') {
      url = `${url}/${item.data.id}`;
      method = 'PUT';
    } else if (item.action === 'delete') {
      url = `${url}/${item.data.id}`;
      method = 'DELETE';
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: item.action !== 'delete' ? JSON.stringify(item.data) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Price alert sync failed');
    }

    console.log('[Sync Manager] Price alert synced successfully:', item.id);
    return { success: true, itemId: item.id };
  } catch (error: any) {
    console.error('[Sync Manager] Price alert sync failed:', error);
    return { success: false, itemId: item.id, error: error.message };
  }
};

/**
 * Sync notification preferences
 */
const syncPreferences = async (item: SyncQueueItem): Promise<SyncResult> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/notifications/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Preferences sync failed');
    }

    console.log('[Sync Manager] Preferences synced successfully:', item.id);
    return { success: true, itemId: item.id };
  } catch (error: any) {
    console.error('[Sync Manager] Preferences sync failed:', error);
    return { success: false, itemId: item.id, error: error.message };
  }
};

/**
 * Sync payment
 */
const syncPayment = async (item: SyncQueueItem): Promise<SyncResult> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/api/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(item.data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment sync failed');
    }

    console.log('[Sync Manager] Payment synced successfully:', item.id);
    return { success: true, itemId: item.id };
  } catch (error: any) {
    console.error('[Sync Manager] Payment sync failed:', error);
    return { success: false, itemId: item.id, error: error.message };
  }
};

/**
 * Sync a single item based on type
 */
const syncItem = async (item: SyncQueueItem): Promise<SyncResult> => {
  // Mark as processing
  await syncQueue.update({ ...item, status: 'processing' });

  let result: SyncResult;

  switch (item.type) {
    case 'booking':
      result = await syncBooking(item);
      break;
    case 'price-alert':
      result = await syncPriceAlert(item);
      break;
    case 'preference':
      result = await syncPreferences(item);
      break;
    case 'payment':
      result = await syncPayment(item);
      break;
    default:
      result = { success: false, itemId: item.id, error: 'Unknown type' };
  }

  // Update item status
  if (result.success) {
    await syncQueue.update({ ...item, status: 'completed' });
    // Delete completed item after 24 hours
    setTimeout(() => syncQueue.delete(item.id), 24 * 60 * 60 * 1000);
  } else {
    const retryCount = item.retryCount + 1;
    const maxRetries = 3;

    if (retryCount >= maxRetries) {
      await syncQueue.update({ ...item, status: 'failed', retryCount });
      console.error('[Sync Manager] Max retries reached for item:', item.id);
    } else {
      await syncQueue.update({ ...item, status: 'pending', retryCount });
      console.log(`[Sync Manager] Item will retry (${retryCount}/${maxRetries}):`, item.id);
    }
  }

  return result;
};

/**
 * Sync all pending items
 */
export const syncAll = async (): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: SyncResult[];
}> => {
  try {
    console.log('[Sync Manager] Starting sync...');

    const pendingItems = await syncQueue.getPending();

    if (pendingItems.length === 0) {
      console.log('[Sync Manager] No pending items to sync');
      return { total: 0, successful: 0, failed: 0, results: [] };
    }

    console.log(`[Sync Manager] Syncing ${pendingItems.length} items...`);

    const results: SyncResult[] = [];

    // Sync items sequentially to avoid overwhelming the server
    for (const item of pendingItems) {
      const result = await syncItem(item);
      results.push(result);

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[Sync Manager] Sync completed: ${successful} successful, ${failed} failed`);

    return {
      total: pendingItems.length,
      successful,
      failed,
      results,
    };
  } catch (error) {
    console.error('[Sync Manager] Error during sync:', error);
    return { total: 0, successful: 0, failed: 0, results: [] };
  }
};

/**
 * Get sync status
 */
export const getSyncStatus = async (): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}> => {
  try {
    const allItems = await syncQueue.getAll();

    return {
      pending: allItems.filter(item => item.status === 'pending').length,
      processing: allItems.filter(item => item.status === 'processing').length,
      completed: allItems.filter(item => item.status === 'completed').length,
      failed: allItems.filter(item => item.status === 'failed').length,
    };
  } catch (error) {
    console.error('[Sync Manager] Error getting sync status:', error);
    return { pending: 0, processing: 0, completed: 0, failed: 0 };
  }
};

/**
 * Clear completed items
 */
export const clearCompleted = async (): Promise<number> => {
  try {
    const allItems = await syncQueue.getAll();
    const completed = allItems.filter(item => item.status === 'completed');

    for (const item of completed) {
      await syncQueue.delete(item.id);
    }

    console.log(`[Sync Manager] Cleared ${completed.length} completed items`);
    return completed.length;
  } catch (error) {
    console.error('[Sync Manager] Error clearing completed:', error);
    return 0;
  }
};

/**
 * Retry failed items
 */
export const retryFailed = async (): Promise<SyncResult[]> => {
  try {
    const allItems = await syncQueue.getAll();
    const failed = allItems.filter(item => item.status === 'failed');

    console.log(`[Sync Manager] Retrying ${failed.length} failed items...`);

    const results: SyncResult[] = [];

    for (const item of failed) {
      // Reset retry count
      const resetItem = { ...item, status: 'pending' as const, retryCount: 0 };
      await syncQueue.update(resetItem);

      const result = await syncItem(resetItem);
      results.push(result);

      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
  } catch (error) {
    console.error('[Sync Manager] Error retrying failed:', error);
    return [];
  }
};

/**
 * Auto-sync when online
 */
export const setupAutoSync = () => {
  // Sync when coming online
  window.addEventListener('online', async () => {
    console.log('[Sync Manager] Connection restored, starting sync...');

    const status = await getSyncStatus();
    if (status.pending > 0) {
      const result = await syncAll();
      console.log('[Sync Manager] Auto-sync completed:', result);

      // Notify user
      if (result.successful > 0) {
        console.log(`✅ ${result.successful} items synced successfully`);
      }
      if (result.failed > 0) {
        console.warn(`⚠️ ${result.failed} items failed to sync`);
      }
    }
  });

  // Periodic sync check (every 5 minutes when online)
  setInterval(async () => {
    if (navigator.onLine) {
      const status = await getSyncStatus();
      if (status.pending > 0) {
        console.log('[Sync Manager] Periodic sync check, syncing pending items...');
        await syncAll();
      }
    }
  }, 5 * 60 * 1000);

  console.log('[Sync Manager] Auto-sync configured');
};

export default {
  syncAll,
  getSyncStatus,
  clearCompleted,
  retryFailed,
  setupAutoSync,
};
