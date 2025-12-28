import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import AnalyticsDashboard from "../components/admin/AnalyticsDashboard";
import UserManagement from "../components/admin/UserManagement";
import BookingManagement from "../components/admin/BookingManagement";
import {
  MdDashboard as LayoutDashboard,
  MdPeople as Users,
  MdFlightTakeoff as Plane,
  MdSettings as Settings,
} from "react-icons/md";

type AdminTab = "analytics" | "users" | "bookings" | "settings";

const AdminDashboardPage: React.FC = () => {
  const { currentUser, userRole } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");

  const tabs = [
    { id: "analytics" as AdminTab, label: "Analytics", icon: LayoutDashboard },
    { id: "users" as AdminTab, label: "Users", icon: Users },
    { id: "bookings" as AdminTab, label: "Bookings", icon: Plane },
    { id: "settings" as AdminTab, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {currentUser?.displayName || currentUser?.email}!
            {userRole && (
              <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {userRole}
              </span>
            )}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-cyan-600 text-cyan-600 dark:text-cyan-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          {activeTab === "analytics" && <AnalyticsDashboard />}
          {activeTab === "users" && <UserManagement />}
          {activeTab === "bookings" && <BookingManagement />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </div>
    </div>
  );
};

// Settings Component
const AdminSettings: React.FC = () => {
  const { currentUser, userRole } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Admin Settings
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* System Information */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Information
          </h3>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Admin User</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">Role</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">
                {userRole}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-600 dark:text-gray-400">User ID</dt>
              <dd className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.uid}
              </dd>
            </div>
          </dl>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition">
              Export All Data
            </button>
            <button className="w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">
              Generate Reports
            </button>
            <button className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
              Clear Cache
            </button>
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Application Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Email Notifications
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Send email notifications for new bookings
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Auto-confirm Bookings
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Automatically confirm bookings after payment
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Maintenance Mode
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Disable booking for maintenance
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Database Actions */}
      {userRole === "superadmin" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4">
            Danger Zone
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
            These actions are irreversible. Use with caution.
          </p>
          <div className="space-y-3">
            <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              Reset All Analytics
            </button>
            <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
              Clear All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
