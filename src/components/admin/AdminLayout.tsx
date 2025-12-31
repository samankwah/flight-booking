// src/components/admin/AdminLayout.tsx
import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  MdDashboard,
  MdFlightTakeoff,
  MdPeople,
  MdLocalOffer,
  MdAnalytics,
  MdSettings,
  MdSchool,
  MdAssignment,
  MdBook,
  MdMenu,
  MdClose,
  MdLogout,
  MdHome,
  MdDescription, // For Visa Applications
  MdHotel, // For Hotel Bookings
  MdBeachAccess // For Holiday Packages
} from 'react-icons/md';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [sidebarOpen]);

  const bookingItems = [
    { path: '/admin/bookings', icon: MdFlightTakeoff, label: 'Flight Bookings' },
    { path: '/admin/visa-applications', icon: MdDescription, label: 'Visa Applications' },
    { path: '/admin/hotel-bookings', icon: MdHotel, label: 'Hotel Bookings' },
    { path: '/admin/holiday-package-bookings', icon: MdBeachAccess, label: 'Holiday Packages' }
  ];

  const userContentItems = [
    { path: '/admin/users', icon: MdPeople, label: 'Users' },
    { path: '/admin/offers', icon: MdLocalOffer, label: 'Special Offers' },
    { path: '/admin/deals', icon: MdLocalOffer, label: 'Top Deals' },
    { path: '/admin/universities', icon: MdSchool, label: 'Universities' },
    { path: '/admin/applications', icon: MdAssignment, label: 'Study Applications' },
    { path: '/admin/programs', icon: MdBook, label: 'Study Programs' }
  ];

  const systemItems = [
    { path: '/admin/analytics', icon: MdAnalytics, label: 'Analytics' },
    { path: '/admin/settings', icon: MdSettings, label: 'Settings' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed on all screen sizes */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-cyan-600">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col h-[calc(100vh-4rem)]">
          <nav className="p-2 space-y-1 overflow-y-auto flex-1">
            {/* Dashboard */}
            <NavLink
              to="/admin"
              end={true}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <MdDashboard className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-cyan-600'}`} />
                  <span className="text-sm font-medium">Dashboard</span>
                </>
              )}
            </NavLink>

            {/* Booking Management Section */}
            <div className="pt-3 pb-1">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Booking Management</h3>
            </div>
            {bookingItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-cyan-600'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* User & Content Management Section */}
            <div className="pt-3 pb-1">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">User & Content</h3>
            </div>
            {userContentItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-cyan-600'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* Analytics & Settings Section */}
            <div className="pt-3 pb-1">
              <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Analytics & Settings</h3>
            </div>
            {systemItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg transition-all group ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-cyan-600'}`} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Bottom Section - Fixed at bottom */}
          <div className="p-2 space-y-1 border-t border-gray-200 bg-white">
            {/* Return to Main Site */}
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              <MdHome className="w-4 h-4" />
              <span className="text-sm font-medium">Main Site</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
            >
              <MdLogout className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content - Add left margin on desktop for fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <MdMenu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:flex-none" />

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser?.displayName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {currentUser?.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
