// src/pages/admin/AdminDashboard.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import StatCard from "../../components/admin/StatCard";
import StatusBadge from "../../components/admin/StatusBadge";
import {
  MdFlightTakeoff,
  MdAttachMoney,
  MdPeople,
  MdPending,
  MdTrendingUp,
} from "react-icons/md";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../utils/apiConfig";

interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingBookings: number;
}

interface RecentBooking {
  id: string;
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  status: string;
  totalPrice: number;
  currency: string;
  bookingDate: string;
}

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();

      // Fetch dashboard stats
      const statsResponse = await fetch(
        `${API_BASE_URL}/admin/analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }

      // Fetch recent bookings
      const bookingsResponse = await fetch(
        `${API_BASE_URL}/admin/bookings?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        if (bookingsData.success) {
          setRecentBookings(bookingsData.bookings);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
          Welcome back, {currentUser?.displayName || "Admin"}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={MdFlightTakeoff}
          label="Total Bookings"
          value={loading ? "..." : stats.totalBookings}
          color="blue"
        />
        <StatCard
          icon={MdAttachMoney}
          label="Total Revenue"
          value={loading ? "..." : `$${stats.totalRevenue.toLocaleString()}`}
          color="green"
        />
        <StatCard
          icon={MdPeople}
          label="Active Users"
          value={loading ? "..." : stats.activeUsers}
          color="purple"
        />
        <StatCard
          icon={MdPending}
          label="Pending Bookings"
          value={loading ? "..." : stats.pendingBookings}
          color="orange"
        />
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Recent Bookings
          </h2>
          <Link
            to="/admin/bookings"
            className="text-xs md:text-sm font-medium text-cyan-600 hover:text-cyan-700 whitespace-nowrap"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading recent bookings...</p>
          </div>
        ) : recentBookings.length === 0 ? (
          <div className="p-12 text-center">
            <MdFlightTakeoff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passenger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.passengerInfo?.firstName}{" "}
                      {booking.passengerInfo?.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={booking.status} type="booking" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {booking.currency} {booking.totalPrice}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6 mt-6 md:mt-8">
        <Link
          to="/admin/bookings"
          className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-4 md:p-6 text-white hover:shadow-lg transition-shadow"
        >
          <MdFlightTakeoff className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" />
          <h3 className="text-base md:text-lg font-semibold mb-1">Flight Bookings</h3>
          <p className="text-xs md:text-sm text-blue-100">
            View and manage flight bookings
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 md:p-6 text-white hover:shadow-lg transition-shadow"
        >
          <MdPeople className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" />
          <h3 className="text-base md:text-lg font-semibold mb-1">Manage Users</h3>
          <p className="text-xs md:text-sm text-purple-100">
            View and manage user accounts
          </p>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 md:p-6 text-white hover:shadow-lg transition-shadow"
        >
          <MdTrendingUp className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" />
          <h3 className="text-base md:text-lg font-semibold mb-1">View Analytics</h3>
          <p className="text-xs md:text-sm text-green-100">Revenue and booking trends</p>
        </Link>

        <Link
          to="/admin/visa-applications"
          className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 md:p-6 text-white hover:shadow-lg transition-shadow"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-base md:text-lg font-semibold mb-1">Visa Applications</h3>
          <p className="text-xs md:text-sm text-purple-100">
            Manage visa applications
          </p>
        </Link>

        <Link
          to="/admin/hotel-bookings"
          className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-4 md:p-6 text-white hover:shadow-lg transition-shadow"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className="text-base md:text-lg font-semibold mb-1">Hotel Bookings</h3>
          <p className="text-xs md:text-sm text-orange-100">
            Manage hotel reservations
          </p>
        </Link>

        <Link
          to="/admin/holiday-package-bookings"
          className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-4 md:p-6 text-white hover:shadow-lg transition-shadow"
        >
          <svg className="w-6 h-6 md:w-8 md:h-8 mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-1.657 0-3-1.343-3-3m3 3c1.657 0 3-1.343 3-3m-3 3V3" />
          </svg>
          <h3 className="text-base md:text-lg font-semibold mb-1">Holiday Packages</h3>
          <p className="text-xs md:text-sm text-teal-100">
            Manage holiday bookings
          </p>
        </Link>
      </div>
    </div>
  );
}
