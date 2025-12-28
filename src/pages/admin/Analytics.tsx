// src/pages/admin/Analytics.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import StatCard from "../../components/admin/StatCard";
import {
  MdAttachMoney,
  MdTrendingUp,
  MdFlightTakeoff,
  MdRefresh,
} from "react-icons/md";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../../utils/apiConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface PopularRoute {
  route: string;
  bookings: number;
  revenue: number;
}

export default function Analytics() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [averageBookingValue, setAverageBookingValue] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [dateRange, setDateRange] = useState("30"); // days

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (!currentUser) return;

      const token = await currentUser.getIdToken();
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch revenue stats
      const revenueResponse = await fetch(
        `${API_BASE_URL}/admin/analytics/revenue?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        if (revenueData.success) {
          setTotalRevenue(revenueData.totalRevenue || 0);
          setTotalBookings(revenueData.bookingCount || 0);
          setAverageBookingValue(revenueData.averageBookingValue || 0);

          // Convert revenueByDate object to array
          const revenueByDate = revenueData.revenueByDate || {};
          const revenueArray: RevenueData[] = Object.entries(revenueByDate).map(
            ([date, revenue]) => ({
              date,
              revenue: revenue as number,
              bookings: 0,
            })
          );
          setRevenueData(revenueArray);
        }
      }

      // Fetch popular routes
      const routesResponse = await fetch(
        `${API_BASE_URL}/admin/analytics/routes?limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (routesResponse.ok) {
        const routesData = await routesResponse.json();
        if (routesData.success) {
          setPopularRoutes(routesData.routes || []);
        }
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Analytics
            </h1>
            <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">
              Revenue and booking insights
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button
              onClick={fetchAnalytics}
              className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm md:text-base bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <MdRefresh className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={MdAttachMoney}
          label="Total Revenue"
          value={loading ? "..." : `$${totalRevenue.toLocaleString()}`}
          color="green"
          trend={revenueGrowth > 0 ? "up" : "down"}
          trendValue={Math.abs(revenueGrowth)}
        />
        <StatCard
          icon={MdTrendingUp}
          label="Average Booking Value"
          value={loading ? "..." : `$${averageBookingValue.toFixed(2)}`}
          color="blue"
        />
        <StatCard
          icon={MdFlightTakeoff}
          label="Total Bookings"
          value={loading ? "..." : totalBookings}
          color="purple"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          Revenue Trends
        </h2>
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-600"></div>
          </div>
        ) : revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={revenueData.map((item) => ({
                ...item,
                date: new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
              }))}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  padding: "12px",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", r: 4 }}
                activeDot={{ r: 6 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">
              No revenue data available for this period
            </p>
          </div>
        )}
      </div>

      {/* Popular Routes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Popular Routes
          </h2>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-cyan-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading routes...</p>
          </div>
        ) : popularRoutes.length === 0 ? (
          <div className="p-12 text-center">
            <MdFlightTakeoff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No route data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bookings
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popularRoutes.map((route, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.route}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.bookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${route.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
