import React, { useState, useEffect } from 'react';
import { MdRefresh, MdClose } from 'react-icons/md';
import { checkForUpdates, activateUpdate } from '../utils/pwa';

/**
 * PWA Update Notification
 * Shows when a new version of the app is available
 */
export const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Check for updates on mount
    checkForUpdates().then((hasUpdate) => {
      if (hasUpdate) {
        setShowUpdate(true);
      }
    });

    // Check for updates every 30 minutes
    const interval = setInterval(() => {
      checkForUpdates().then((hasUpdate) => {
        if (hasUpdate) {
          setShowUpdate(true);
        }
      });
    }, 30 * 60 * 1000);

    // Listen for new service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(false);
        setUpdating(false);
      });
    }

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    setUpdating(true);
    activateUpdate();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
    // Remind again in 1 hour
    setTimeout(() => {
      checkForUpdates().then((hasUpdate) => {
        if (hasUpdate) setShowUpdate(true);
      });
    }, 60 * 60 * 1000);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-w-md animate-slide-in">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full p-2">
            <MdRefresh className="w-5 h-5 text-white" />
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Update Available
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              A new version of the app is ready. Update now for the latest features and improvements!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={updating}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:from-cyan-700 hover:to-blue-700 transition disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Now'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-100 transition"
              >
                Later
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded transition"
            aria-label="Dismiss"
          >
            <MdClose className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Add animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}
