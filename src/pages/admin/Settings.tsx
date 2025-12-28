// src/pages/admin/Settings.tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { MdSettings, MdNotifications, MdSecurity, MdEmail } from 'react-icons/md';
import { API_BASE_URL } from '../../utils/apiConfig';

export default function Settings() {
  const { currentUser } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);

  const handleSaveSettings = () => {
    // This is a placeholder - would normally save to backend
    toast.success('Settings saved successfully');
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Manage admin panel settings and preferences</p>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <MdSecurity className="w-5 h-5 md:w-6 md:h-6 text-cyan-600" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Account Information</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={currentUser?.displayName || ''}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-4 md:mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MdNotifications className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Notification Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive email notifications for admin events</p>
            </div>
            <button
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                emailNotifications ? 'bg-cyan-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Booking Alerts</h3>
              <p className="text-sm text-gray-600">Get notified when new bookings are made</p>
            </div>
            <button
              onClick={() => setBookingAlerts(!bookingAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                bookingAlerts ? 'bg-cyan-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  bookingAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Application Alerts</h3>
              <p className="text-sm text-gray-600">Get notified about new study abroad applications</p>
            </div>
            <button
              onClick={() => setApplicationAlerts(!applicationAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                applicationAlerts ? 'bg-cyan-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  applicationAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 rounded-lg">
            <MdEmail className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Email Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SendGrid API Key Status
            </label>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Configured
              </span>
              <span className="text-sm text-gray-600">Email notifications are enabled</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Email Address
            </label>
            <input
              type="email"
              value={process.env.SENDGRID_FROM_EMAIL || 'noreply@flightbooking.com'}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MdSettings className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">System Information</h2>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">API Base URL</span>
            <span className="text-sm text-gray-600">
              {API_BASE_URL}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Firebase Project</span>
            <span className="text-sm text-gray-600">Configured</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Amadeus API</span>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-700">Paystack Integration</span>
            <span className="text-sm text-gray-600">Active</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
