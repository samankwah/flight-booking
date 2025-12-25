// src/components/NotificationInitializer.tsx

import { useEffect, useState } from 'react';
import { initNotifications } from '../utils/notifications';
import { useAuth } from '../contexts/AuthContext';

/**
 * Component that initializes push notifications when user is logged in
 * Place this component in your App.tsx or layout component
 */
const NotificationInitializer: React.FC = () => {
  const { user } = useAuth();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const setupNotifications = async () => {
      // Only initialize once per session
      if (initialized || !user) return;

      try {
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

        // Don't initialize if VAPID key is not configured
        if (!vapidKey) {
          console.warn('[Notifications] VAPID public key not configured');
          return;
        }

        const result = await initNotifications({
          vapidPublicKey: vapidKey,
          userId: user.uid,
          autoRequest: false, // Don't auto-request, let user enable from settings
        });

        console.log('[Notifications] Initialized:', result);
        setInitialized(true);
      } catch (error) {
        console.error('[Notifications] Failed to initialize:', error);
      }
    };

    setupNotifications();
  }, [user, initialized]);

  // This component doesn't render anything
  return null;
};

export default NotificationInitializer;
