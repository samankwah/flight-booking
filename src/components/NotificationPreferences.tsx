// src/components/NotificationPreferences.tsx

import React, { useState, useEffect } from 'react';
import { MdNotifications, MdNotificationsOff, MdCheck, MdClose } from 'react-icons/md';
import {
  getNotificationPermission,
  requestNotificationPermission,
  initNotifications,
  testNotification,
  NotificationPreferences as INotificationPreferences,
} from '../utils/notifications';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface NotificationPreferencesProps {
  userId?: string;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ userId }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<INotificationPreferences>({
    priceAlerts: true,
    bookingUpdates: true,
    promotions: false,
    flightReminders: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
    setPermission(getNotificationPermission());
  }, [userId]);

  const loadPreferences = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');

      if (!token) {
        // Load from localStorage if not logged in
        const stored = localStorage.getItem('notificationPreferences');
        if (stored) {
          setPreferences(JSON.parse(stored));
        }
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setPreferences(result.data);
      }
    } catch (err) {
      console.error('Failed to load preferences:', err);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: INotificationPreferences) => {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('authToken');

      if (!token || !userId) {
        // Save to localStorage if not logged in
        localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
        setSuccessMessage('Preferences saved locally');
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      setSuccessMessage('Preferences saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save notification preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePreference = (key: keyof INotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);
      setError(null);

      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);

      if (newPermission === 'granted') {
        // Initialize notifications with VAPID key
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        await initNotifications({
          vapidPublicKey: vapidKey,
          userId,
          autoRequest: false,
        });

        setSuccessMessage('Notifications enabled successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Notification permission denied');
      }
    } catch (err) {
      console.error('Failed to enable notifications:', err);
      setError('Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      if (permission !== 'granted') {
        setError('Please enable notifications first');
        return;
      }

      await testNotification();
      setSuccessMessage('Test notification sent!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to send test notification:', err);
      setError('Failed to send test notification');
    }
  };

  const PreferenceToggle: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
    disabled?: boolean;
  }> = ({ label, description, enabled, onChange, disabled }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        disabled={disabled || permission !== 'granted'}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          enabled ? 'bg-cyan-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  if (loading && !preferences) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MdNotifications className="w-6 h-6 text-cyan-600" />
              Notification Settings
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage how you receive flight updates and alerts
            </p>
          </div>
        </div>

        {/* Permission Status */}
        <div className={`rounded-lg p-4 mb-6 ${
          permission === 'granted'
            ? 'bg-green-50 dark:bg-green-900/20'
            : permission === 'denied'
            ? 'bg-red-50 dark:bg-red-900/20'
            : 'bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {permission === 'granted' ? (
                <MdCheck className="w-6 h-6 text-green-600" />
              ) : (
                <MdNotificationsOff className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {permission === 'granted'
                    ? 'Notifications Enabled'
                    : permission === 'denied'
                    ? 'Notifications Blocked'
                    : 'Notifications Disabled'}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {permission === 'granted'
                    ? 'You will receive push notifications for your selected preferences'
                    : permission === 'denied'
                    ? 'Please enable notifications in your browser settings'
                    : 'Enable notifications to receive flight updates and alerts'}
                </p>
              </div>
            </div>
            {permission !== 'granted' && permission !== 'denied' && (
              <button
                onClick={handleEnableNotifications}
                disabled={loading}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 text-sm font-medium"
              >
                {loading ? 'Enabling...' : 'Enable'}
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-center gap-2">
            <MdClose className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex items-center gap-2">
            <MdCheck className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
          </div>
        )}

        {/* Notification Preferences */}
        <div className="space-y-1">
          <PreferenceToggle
            label="Price Alerts"
            description="Get notified when flight prices drop for your saved routes"
            enabled={preferences.priceAlerts}
            onChange={() => handleTogglePreference('priceAlerts')}
            disabled={saving}
          />
          <PreferenceToggle
            label="Booking Updates"
            description="Receive updates about your bookings and flight changes"
            enabled={preferences.bookingUpdates}
            onChange={() => handleTogglePreference('bookingUpdates')}
            disabled={saving}
          />
          <PreferenceToggle
            label="Flight Reminders"
            description="Get reminders before your scheduled flights"
            enabled={preferences.flightReminders}
            onChange={() => handleTogglePreference('flightReminders')}
            disabled={saving}
          />
          <PreferenceToggle
            label="Promotions & Deals"
            description="Receive notifications about special offers and discounts"
            enabled={preferences.promotions}
            onChange={() => handleTogglePreference('promotions')}
            disabled={saving}
          />
        </div>

        {/* Test Notification Button */}
        {permission === 'granted' && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleTestNotification}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm font-medium"
            >
              Send Test Notification
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPreferences;
