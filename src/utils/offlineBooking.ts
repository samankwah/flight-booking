// src/utils/offlineBooking.ts

/**
 * Offline Booking Manager
 *
 * Handles saving booking drafts when offline and syncing when online
 */

import { bookingDrafts, syncQueue, type BookingDraft, type SyncQueueItem } from './indexedDB';
import { v4 as uuidv4 } from 'uuid';
import type { FlightResult } from '../types';

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  passportNumber?: string;
  nationality?: string;
}

export interface SeatSelection {
  passengerId: string;
  seatNumber: string;
  seatClass?: string;
  price?: number;
}

export interface ContactInformation {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  country?: string;
}

export interface PaymentInformation {
  method: 'card' | 'paystack';
  amount: number;
  currency: string;
  paymentIntentId?: string;
  status?: 'pending' | 'completed' | 'failed';
}

export interface BookingData {
  flightId: string;
  flightDetails: FlightResult;
  passengers: PassengerDetails[];
  selectedSeats?: SeatSelection[];
  contactInfo?: ContactInformation;
  paymentInfo?: PaymentInformation;
}

/**
 * Save booking draft for offline access
 */
export const saveBookingDraft = async (
  userId: string,
  bookingData: BookingData
): Promise<string> => {
  try {
    const draftId = uuidv4();

    const draft: BookingDraft = {
      id: draftId,
      userId,
      flightId: bookingData.flightId,
      flightDetails: bookingData.flightDetails,
      passengers: bookingData.passengers,
      selectedSeats: bookingData.selectedSeats,
      paymentInfo: bookingData.paymentInfo,
      timestamp: Date.now(),
      status: 'draft',
    };

    await bookingDrafts.save(draft);

    console.log('[Offline Booking] Draft saved:', draftId);
    return draftId;
  } catch (error) {
    console.error('[Offline Booking] Error saving draft:', error);
    throw error;
  }
};

/**
 * Get all booking drafts for a user
 */
export const getUserBookingDrafts = async (userId: string): Promise<BookingDraft[]> => {
  try {
    const drafts = await bookingDrafts.getByUser(userId);
    return drafts.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[Offline Booking] Error getting drafts:', error);
    return [];
  }
};

/**
 * Get a specific booking draft
 */
export const getBookingDraft = async (draftId: string): Promise<BookingDraft | null> => {
  try {
    return await bookingDrafts.get(draftId);
  } catch (error) {
    console.error('[Offline Booking] Error getting draft:', error);
    return null;
  }
};

/**
 * Update booking draft
 */
export const updateBookingDraft = async (
  draftId: string,
  updates: Partial<BookingDraft>
): Promise<boolean> => {
  try {
    const existing = await bookingDrafts.get(draftId);
    if (!existing) {
      console.error('[Offline Booking] Draft not found:', draftId);
      return false;
    }

    const updated = {
      ...existing,
      ...updates,
      timestamp: Date.now(),
    };

    await bookingDrafts.save(updated);
    console.log('[Offline Booking] Draft updated:', draftId);
    return true;
  } catch (error) {
    console.error('[Offline Booking] Error updating draft:', error);
    return false;
  }
};

/**
 * Delete booking draft
 */
export const deleteBookingDraft = async (draftId: string): Promise<boolean> => {
  try {
    await bookingDrafts.delete(draftId);
    console.log('[Offline Booking] Draft deleted:', draftId);
    return true;
  } catch (error) {
    console.error('[Offline Booking] Error deleting draft:', error);
    return false;
  }
};

/**
 * Queue booking for sync when online
 */
export const queueBookingForSync = async (
  bookingData: BookingData,
  userId: string
): Promise<string> => {
  try {
    const queueId = uuidv4();

    const queueItem: SyncQueueItem = {
      id: queueId,
      type: 'booking',
      action: 'create',
      data: {
        ...bookingData,
        userId,
      },
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
    };

    await syncQueue.add(queueItem);

    console.log('[Offline Booking] Booking queued for sync:', queueId);

    // Also save as draft
    await saveBookingDraft(userId, bookingData);

    // Request background sync if available
    if ('serviceWorker' in navigator && 'sync' in (ServiceWorkerRegistration as any).prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-bookings');
        console.log('[Offline Booking] Background sync registered');
      } catch (error) {
        console.warn('[Offline Booking] Background sync not supported:', error);
      }
    }

    return queueId;
  } catch (error) {
    console.error('[Offline Booking] Error queuing booking:', error);
    throw error;
  }
};

/**
 * Get all pending bookings in sync queue
 */
export const getPendingBookings = async (): Promise<SyncQueueItem[]> => {
  try {
    const pending = await syncQueue.getPending();
    return pending.filter(item => item.type === 'booking');
  } catch (error) {
    console.error('[Offline Booking] Error getting pending bookings:', error);
    return [];
  }
};

/**
 * Mark draft as synced
 */
export const markDraftAsSynced = async (draftId: string): Promise<boolean> => {
  try {
    return await updateBookingDraft(draftId, { status: 'synced' });
  } catch (error) {
    console.error('[Offline Booking] Error marking as synced:', error);
    return false;
  }
};

/**
 * Get draft count by status
 */
export const getDraftStats = async (userId: string): Promise<{
  total: number;
  drafts: number;
  pending: number;
  synced: number;
}> => {
  try {
    const allDrafts = await bookingDrafts.getByUser(userId);

    return {
      total: allDrafts.length,
      drafts: allDrafts.filter(d => d.status === 'draft').length,
      pending: allDrafts.filter(d => d.status === 'pending').length,
      synced: allDrafts.filter(d => d.status === 'synced').length,
    };
  } catch (error) {
    console.error('[Offline Booking] Error getting stats:', error);
    return { total: 0, drafts: 0, pending: 0, synced: 0 };
  }
};

/**
 * Clear old synced drafts (older than 7 days)
 */
export const clearOldSyncedDrafts = async (): Promise<number> => {
  try {
    const allDrafts = await bookingDrafts.getAll();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    let deletedCount = 0;
    for (const draft of allDrafts) {
      if (draft.status === 'synced' && draft.timestamp < sevenDaysAgo) {
        await bookingDrafts.delete(draft.id);
        deletedCount++;
      }
    }

    console.log(`[Offline Booking] Cleared ${deletedCount} old synced drafts`);
    return deletedCount;
  } catch (error) {
    console.error('[Offline Booking] Error clearing old drafts:', error);
    return 0;
  }
};

export default {
  saveBookingDraft,
  getUserBookingDrafts,
  getBookingDraft,
  updateBookingDraft,
  deleteBookingDraft,
  queueBookingForSync,
  getPendingBookings,
  markDraftAsSynced,
  getDraftStats,
  clearOldSyncedDrafts,
};
