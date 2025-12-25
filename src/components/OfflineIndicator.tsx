// src/components/OfflineIndicator.tsx

import React, { useState, useEffect } from 'react';
import { getSyncStatus, syncAll } from '../utils/syncManager';
import type { SyncQueueItem } from '../utils/indexedDB';

/**
 * Offline Indicator Component
 *
 * Shows:
 * - Online/offline status
 * - Pending sync items count
 * - Manual sync button
 * - Sync progress
 */
export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('[Offline Indicator] Connection restored');
      // Automatically sync when coming online
      handleSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[Offline Indicator] Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load sync status periodically
  useEffect(() => {
    const loadSyncStatus = async () => {
      const status = await getSyncStatus();
      setSyncStatus(status);
    };

    loadSyncStatus();

    // Refresh every 30 seconds
    const interval = setInterval(loadSyncStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen for sync completion messages from service worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log('[Offline Indicator] Sync completed:', event.data.data);
        setIsSyncing(false);
        setLastSyncTime(new Date());

        // Reload sync status
        getSyncStatus().then(setSyncStatus);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleSync = async () => {
    if (isSyncing || !isOnline) return;

    try {
      setIsSyncing(true);
      console.log('[Offline Indicator] Starting manual sync...');

      const result = await syncAll();

      console.log('[Offline Indicator] Sync result:', result);
      setLastSyncTime(new Date());

      // Reload sync status
      const status = await getSyncStatus();
      setSyncStatus(status);
    } catch (error) {
      console.error('[Offline Indicator] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const hasPendingItems = syncStatus.pending > 0 || syncStatus.processing > 0;

  // Don't show if online with no pending items
  if (isOnline && !hasPendingItems && !showDetails) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Main indicator */}
      <div
        className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all cursor-pointer ${
          isOnline
            ? hasPendingItems
              ? 'bg-yellow-500 text-white'
              : 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        {/* Status icon */}
        <div className="relative">
          {isOnline ? (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
              />
            </svg>
          )}

          {/* Sync indicator */}
          {isSyncing && (
            <div className="absolute -top-1 -right-1 w-3 h-3">
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* Status text */}
        <span className="text-sm font-medium">
          {isOnline ? (
            hasPendingItems ? (
              <>
                {syncStatus.pending + syncStatus.processing} items to sync
              </>
            ) : (
              'Online'
            )
          ) : (
            'Offline Mode'
          )}
        </span>

        {/* Expand arrow */}
        <svg
          className={`w-4 h-4 transition-transform ${
            showDetails ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Detailed panel */}
      {showDetails && (
        <div className="mt-2 bg-white rounded-lg shadow-lg p-4 w-72">
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Sync Status
          </h3>

          {/* Status grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-xs text-gray-600">Pending</div>
              <div className="text-lg font-bold text-yellow-600">
                {syncStatus.pending}
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded">
              <div className="text-xs text-gray-600">Processing</div>
              <div className="text-lg font-bold text-blue-600">
                {syncStatus.processing}
              </div>
            </div>

            <div className="bg-green-50 p-2 rounded">
              <div className="text-xs text-gray-600">Completed</div>
              <div className="text-lg font-bold text-green-600">
                {syncStatus.completed}
              </div>
            </div>

            <div className="bg-red-50 p-2 rounded">
              <div className="text-xs text-gray-600">Failed</div>
              <div className="text-lg font-bold text-red-600">
                {syncStatus.failed}
              </div>
            </div>
          </div>

          {/* Last sync time */}
          {lastSyncTime && (
            <div className="text-xs text-gray-500 mb-3">
              Last synced: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={!isOnline || isSyncing || !hasPendingItems}
            className={`w-full py-2 px-4 rounded font-medium text-sm transition-colors ${
              isOnline && hasPendingItems && !isSyncing
                ? 'bg-cyan-600 text-white hover:bg-cyan-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSyncing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Syncing...
              </span>
            ) : !isOnline ? (
              'Offline - Cannot Sync'
            ) : !hasPendingItems ? (
              'Nothing to Sync'
            ) : (
              'Sync Now'
            )}
          </button>

          {/* Info message */}
          {!isOnline && (
            <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
              Your changes are saved locally and will sync automatically when
              you're back online.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
