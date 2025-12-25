// src/utils/pwa.ts

/**
 * PWA Utilities
 * Handles service worker registration, install prompts, and PWA features
 */

let deferredPrompt: any = null;

/**
 * Register service worker
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('[PWA] Service Worker registered:', registration.scope);

      // Check for updates every hour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000);

      return registration;
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.warn('[PWA] Service Workers not supported');
    return null;
  }
};

/**
 * Unregister service worker (for debugging)
 */
export const unregisterServiceWorker = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
      await registration.unregister();
    }

    return true;
  }

  return false;
};

/**
 * Check if app is installed as PWA
 */
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true;
};

/**
 * Check if app can be installed
 */
export const canInstallPWA = (): boolean => {
  return deferredPrompt !== null;
};

/**
 * Setup PWA install prompt
 */
export const setupInstallPrompt = (callback?: (canInstall: boolean) => void): void => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Store the event so it can be triggered later
    deferredPrompt = e;

    console.log('[PWA] Install prompt available');

    // Notify callback that app can be installed
    callback?.(true);
  });

  // Listen for app installation
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App installed');
    deferredPrompt = null;
    callback?.(false);
  });
};

/**
 * Show install prompt
 */
export const showInstallPrompt = async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
  if (!deferredPrompt) {
    console.warn('[PWA] Install prompt not available');
    return 'unavailable';
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;

  console.log('[PWA] User choice:', outcome);

  // Clear the deferred prompt
  deferredPrompt = null;

  return outcome;
};

/**
 * Check for service worker updates
 */
export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();

    if (registration) {
      await registration.update();

      return registration.waiting !== null;
    }
  }

  return false;
};

/**
 * Skip waiting and activate new service worker
 */
export const activateUpdate = (): void => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ action: 'SKIP_WAITING' });

    // Reload page after activation
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }
};

/**
 * Clear all caches
 */
export const clearCaches = async (): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ action: 'CLEAR_CACHE' });
  }

  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }
};

/**
 * Get network status
 */
export const getNetworkStatus = (): {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
} => {
  const connection = (navigator as any).connection;

  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData,
  };
};

/**
 * Listen for network status changes
 */
export const onNetworkChange = (callback: (online: boolean) => void): (() => void) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};

/**
 * Request persistent storage
 */
export const requestPersistentStorage = async (): Promise<boolean> => {
  if ('storage' in navigator && 'persist' in navigator.storage) {
    const granted = await navigator.storage.persist();

    console.log('[PWA] Persistent storage:', granted ? 'granted' : 'denied');

    return granted;
  }

  return false;
};

/**
 * Get storage estimate
 */
export const getStorageEstimate = async (): Promise<{
  usage: number;
  quota: number;
  percentage: number;
} | null> => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();

    return {
      usage: estimate.usage || 0,
      quota: estimate.quota || 0,
      percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
    };
  }

  return null;
};

/**
 * Initialize PWA features
 */
export const initPWA = (options?: {
  onInstallable?: (canInstall: boolean) => void;
  onNetworkChange?: (online: boolean) => void;
}): () => void => {
  // Register service worker
  registerServiceWorker();

  // Setup install prompt
  setupInstallPrompt(options?.onInstallable);

  // Listen for network changes
  const cleanupNetwork = options?.onNetworkChange
    ? onNetworkChange(options.onNetworkChange)
    : () => {};

  // Request persistent storage
  requestPersistentStorage();

  // Return cleanup function
  return cleanupNetwork;
};

/**
 * Check PWA installation status
 */
export const getPWAStatus = (): {
  installed: boolean;
  standalone: boolean;
  canInstall: boolean;
  serviceWorkerActive: boolean;
} => {
  return {
    installed: isPWA(),
    standalone: window.matchMedia('(display-mode: standalone)').matches,
    canInstall: canInstallPWA(),
    serviceWorkerActive: navigator.serviceWorker?.controller !== null,
  };
};
