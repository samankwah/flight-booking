import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import type { AdminStats, Booking, UserData } from "../../types";
import {
  MdFlight,
  MdPeople,
  MdAttachMoney,
  MdLocalOffer,
  MdTrendingUp,
  MdTrendingDown,
} from "react-icons/md";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all bookings
      const bookingsSnapshot = await getDocs(collection(db, "bookings"));
      const bookings: Booking[] = bookingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      // Fetch all users
      const usersSnapshot = await getDocs(collection(db, "users"));
      const users: UserData[] = usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      })) as UserData[];

      // Fetch special offers
      const offersSnapshot = await getDocs(collection(db, "specialOffers"));
      const activeOffers = offersSnapshot.docs.filter(
        (doc) => doc.data().active === true
      ).length;

      // Calculate statistics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
      const pendingBookings = bookings.filter((b) => b.status === "pending");
      const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalPrice, 0);

      const bookingsThisMonth = bookings.filter(
        (b) => new Date(b.bookingDate) >= firstDayOfMonth
      );

      const bookingsLastMonth = bookings.filter(
        (b) =>
          new Date(b.bookingDate) >= firstDayOfLastMonth &&
          new Date(b.bookingDate) <= lastDayOfLastMonth
      );

      const revenueThisMonth = bookingsThisMonth
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalPrice, 0);

      const revenueLastMonth = bookingsLastMonth
        .filter((b) => b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalPrice, 0);

      const newUsersThisMonth = users.filter(
        (u) => new Date(u.createdAt) >= firstDayOfMonth
      ).length;

      const adminStats: AdminStats = {
        totalBookings: bookings.length,
        totalRevenue,
        totalUsers: users.length,
        activeOffers,
        pendingBookings: pendingBookings.length,
        confirmedBookings: confirmedBookings.length,
        cancelledBookings: cancelledBookings.length,
        revenueThisMonth,
        revenueLastMonth,
        newUsersThisMonth,
        bookingsThisMonth: bookingsThisMonth.length,
      };

      setStats(adminStats);

      // Get recent bookings (last 10)
      const sortedBookings = bookings.sort(
        (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
      setRecentBookings(sortedBookings.slice(0, 10));

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  };

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">Failed to load dashboard data</p>
      </div>
    );
  }

  const revenueChange = calculatePercentageChange(
    stats.revenueThisMonth,
    stats.revenueLastMonth
  );

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      change: revenueChange,
      icon: MdAttachMoney,
      iconBg: "bg-green-500",
      subtext: `${formatCurrency(stats.revenueThisMonth)} this month`,
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings.toString(),
      change: null,
      icon: MdFlight,
      iconBg: "bg-blue-500",
      subtext: `${stats.bookingsThisMonth} this month`,
    },
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: null,
      icon: MdPeople,
      iconBg: "bg-purple-500",
      subtext: `${stats.newUsersThisMonth} new this month`,
    },
    {
      title: "Active Offers",
      value: stats.activeOffers.toString(),
      change: null,
      icon: MdLocalOffer,
      iconBg: "bg-orange-500",
      subtext: "Special offers active",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Welcome back! Here's what's happening with your flight booking platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {card.value}
                  </p>
                  {card.change !== null && (
                    <div className="flex items-center gap-1 mt-2">
                      {card.change >= 0 ? (
                        <MdTrendingUp className="text-green-500" />
                      ) : (
                        <MdTrendingDown className="text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          card.change >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Math.abs(card.change).toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        vs last month
                      </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {card.subtext}
                  </p>
                </div>
                <div className={`${card.iconBg} p-3 rounded-lg`}>
                  <Icon className="text-white text-2xl" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Confirmed Bookings
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {stats.confirmedBookings}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total confirmed reservations
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pending Bookings
          </h3>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pendingBookings}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Awaiting confirmation
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Cancelled Bookings
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {stats.cancelledBookings}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Cancelled reservations
          </p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Bookings
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      #{booking.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {booking.flightDetails.departureAirport} →{" "}
                      {booking.flightDetails.arrivalAirport}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {booking.currency} {booking.totalPrice.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
