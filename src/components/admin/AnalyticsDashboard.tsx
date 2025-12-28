import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import type { AdminAnalytics, Booking } from "../../types";
import {
  MdPeople as Users,
  MdFlightTakeoff as Plane,
  MdAttachMoney as DollarSign,
  MdTrendingUp as TrendingUp,
  MdCheckCircle as CheckCircle,
  MdPending as Clock,
  MdCancel as XCircle,
} from "react-icons/md";

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        // Count active users (logged in within last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeUsers = usersSnapshot.docs.filter((doc) => {
          const data = doc.data();
          return data.lastLogin && new Date(data.lastLogin) >= thirtyDaysAgo;
        }).length;

        // Fetch all bookings
        const bookingsSnapshot = await getDocs(collection(db, "bookings"));
        const bookings: Booking[] = bookingsSnapshot.docs.map((doc) => ({
          ...(doc.data() as Booking),
          id: doc.id,
        }));

        const totalBookings = bookings.length;

        // Calculate booking statistics
        const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
        const pendingBookings = bookings.filter((b) => b.status === "pending").length;
        const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;

        // Calculate total revenue (only confirmed bookings)
        const totalRevenue = bookings
          .filter((b) => b.status === "confirmed")
          .reduce((sum, b) => sum + b.totalPrice, 0);

        // Get currency from first booking (assuming consistent currency)
        const currency = bookings.length > 0 ? bookings[0].currency : "USD";

        // Calculate revenue by month (last 6 months)
        const revenueByMonth = calculateRevenueByMonth(bookings);

        // Calculate popular destinations
        const popularDestinations = calculatePopularDestinations(bookings);

        // Get recent bookings (last 10)
        const recentBookings = bookings
          .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
          .slice(0, 10);

        setAnalytics({
          totalUsers,
          totalBookings,
          totalRevenue,
          currency,
          activeUsers,
          pendingBookings,
          confirmedBookings,
          cancelledBookings,
          revenueByMonth,
          popularDestinations,
          recentBookings,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError("Failed to load analytics data");
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const calculateRevenueByMonth = (bookings: Booking[]) => {
    const monthlyData: { [key: string]: { revenue: number; bookings: number } } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      monthlyData[monthKey] = { revenue: 0, bookings: 0 };
    }

    bookings
      .filter((b) => b.status === "confirmed")
      .forEach((booking) => {
        const bookingDate = new Date(booking.bookingDate);
        const monthKey = bookingDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].revenue += booking.totalPrice;
          monthlyData[monthKey].bookings += 1;
        }
      });

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      bookings: data.bookings,
    }));
  };

  const calculatePopularDestinations = (bookings: Booking[]) => {
    const destinationData: { [key: string]: { bookings: number; revenue: number } } = {};

    bookings
      .filter((b) => b.status === "confirmed")
      .forEach((booking) => {
        const destination = `${booking.flightDetails.arrivalAirport}`;
        if (!destinationData[destination]) {
          destinationData[destination] = { bookings: 0, revenue: 0 };
        }
        destinationData[destination].bookings += 1;
        destinationData[destination].revenue += booking.totalPrice;
      });

    return Object.entries(destinationData)
      .map(([destination, data]) => ({
        destination,
        bookings: data.bookings,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalUsers}</p>
              <p className="text-sm text-green-600 mt-1">
                {analytics.activeUsers} active
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalBookings}</p>
              <p className="text-sm text-cyan-600 mt-1">
                {analytics.confirmedBookings} confirmed
              </p>
            </div>
            <Plane className="w-12 h-12 text-cyan-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {analytics.currency} {analytics.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> From confirmed bookings
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Booking Status</p>
              <div className="mt-2 space-y-1">
                <p className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" /> {analytics.confirmedBookings} Confirmed
                </p>
                <p className="text-sm flex items-center gap-2 text-yellow-600">
                  <Clock className="w-4 h-4" /> {analytics.pendingBookings} Pending
                </p>
                <p className="text-sm flex items-center gap-2 text-red-600">
                  <XCircle className="w-4 h-4" /> {analytics.cancelledBookings} Cancelled
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Revenue by Month
        </h3>
        <div className="space-y-3">
          {analytics.revenueByMonth.map((month) => (
            <div key={month.month}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">{month.month}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {analytics.currency} {month.revenue.toLocaleString()} ({month.bookings} bookings)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-cyan-600 h-2 rounded-full"
                  style={{
                    width: `${(month.revenue / Math.max(...analytics.revenueByMonth.map((m) => m.revenue))) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Destinations */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Popular Destinations
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.popularDestinations.map((dest) => (
                <tr key={dest.destination}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {dest.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {dest.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {analytics.currency} {dest.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
