/**
 * AnalyticsService - Replaces in-memory analytics filtering with proper Firestore queries
 * This service provides efficient analytics without fetching all documents
 */

import { WhereFilterOp } from 'firebase-admin/firestore';
import { bookingService } from './BookingService.js';
import { hotelBookingService } from './HotelBookingService.js';
import { holidayBookingService } from './HolidayBookingService.js';
import { visaApplicationService } from './VisaApplicationService.js';
import { applicationService } from './ApplicationService.js';
import { userService } from './UserService.js';

export interface DateRange {
  start: string;
  end: string;
}

export interface RevenueStatistics {
  totalRevenue: number;
  flightRevenue: number;
  hotelRevenue: number;
  holidayRevenue: number;
  currency: string;
  bookingCount: number;
  averageBookingValue: number;
}

export interface BookingTrends {
  daily: Array<{ date: string; count: number; revenue: number }>;
  weekly: Array<{ week: string; count: number; revenue: number }>;
  monthly: Array<{ month: string; count: number; revenue: number }>;
}

export interface PopularRoute {
  from: string;
  to: string;
  count: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface DashboardMetrics {
  overview: {
    totalUsers: number;
    totalBookings: number;
    totalRevenue: number;
    recentSignups: number;
  };
  bookings: {
    pending: number;
    confirmed: number;
    cancelled: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  revenue: RevenueStatistics;
}

export class AnalyticsService {
  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboardMetrics(dateRange?: DateRange): Promise<DashboardMetrics> {
    // Run queries in parallel for performance
    const [
      userStats,
      bookingStats,
      hotelStats,
      holidayStats,
      visaStats,
      applicationStats
    ] = await Promise.all([
      userService.getStatistics(),
      bookingService.getStatistics(dateRange),
      hotelBookingService.getStatistics(dateRange),
      holidayBookingService.getStatistics(dateRange),
      visaApplicationService.getStatistics(dateRange),
      applicationService.getStatistics(dateRange)
    ]);

    return {
      overview: {
        totalUsers: userStats.total,
        totalBookings: bookingStats.total + hotelStats.total + holidayStats.total,
        totalRevenue: 0, // Will be calculated from revenue stats
        recentSignups: userStats.recentSignups
      },
      bookings: {
        pending: bookingStats.pending + hotelStats.pending + holidayStats.pending,
        confirmed: bookingStats.confirmed + hotelStats.confirmed + holidayStats.confirmed,
        cancelled: bookingStats.cancelled + hotelStats.cancelled + holidayStats.cancelled
      },
      applications: {
        total: visaStats.total + applicationStats.total,
        pending: visaStats.underReview + applicationStats.underReview,
        approved: visaStats.approved + applicationStats.accepted,
        rejected: visaStats.rejected + applicationStats.rejected
      },
      revenue: await this.getRevenueStatistics(dateRange)
    };
  }

  /**
   * Get revenue statistics across all booking types
   */
  async getRevenueStatistics(dateRange?: DateRange): Promise<RevenueStatistics> {
    const queryOptions: any = {};

    if (dateRange) {
      queryOptions.where = [
        { field: 'bookingDate', operator: '>=', value: dateRange.start },
        { field: 'bookingDate', operator: '<=', value: dateRange.end }
      ];
    }

    // Fetch paid bookings in parallel
    const [flightBookings, hotelBookings, holidayBookings] = await Promise.all([
      bookingService.findAll({
        ...queryOptions,
        where: [
          ...(queryOptions.where || []),
          { field: 'paymentStatus', operator: '==', value: 'paid' }
        ]
      }),
      hotelBookingService.findAll({
        ...queryOptions,
        where: [
          ...(queryOptions.where || []),
          { field: 'paymentStatus', operator: '==', value: 'paid' }
        ]
      }),
      holidayBookingService.findAll({
        ...queryOptions,
        where: [
          ...(queryOptions.where || []),
          { field: 'paymentStatus', operator: '==', value: 'paid' }
        ]
      })
    ]);

    const flightRevenue = flightBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const hotelRevenue = hotelBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const holidayRevenue = holidayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
    const totalRevenue = flightRevenue + hotelRevenue + holidayRevenue;
    const totalBookings = flightBookings.length + hotelBookings.length + holidayBookings.length;

    return {
      totalRevenue,
      flightRevenue,
      hotelRevenue,
      holidayRevenue,
      currency: 'USD', // Default currency
      bookingCount: totalBookings,
      averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0
    };
  }

  /**
   * Get booking trends over time
   */
  async getBookingTrends(dateRange: DateRange): Promise<BookingTrends> {
    const queryOptions = {
      where: [
        { field: 'bookingDate', operator: '>=' as WhereFilterOp, value: dateRange.start },
        { field: 'bookingDate', operator: '<=' as WhereFilterOp, value: dateRange.end },
        { field: 'paymentStatus', operator: '==' as WhereFilterOp, value: 'paid' }
      ]
    };

    // Fetch all paid bookings in date range
    const [flightBookings, hotelBookings, holidayBookings] = await Promise.all([
      bookingService.findAll(queryOptions),
      hotelBookingService.findAll(queryOptions),
      holidayBookingService.findAll(queryOptions)
    ]);

    const allBookings = [
      ...flightBookings.map(b => ({ date: b.bookingDate, price: b.totalPrice })),
      ...hotelBookings.map(b => ({ date: b.bookingDate, price: b.totalPrice })),
      ...holidayBookings.map(b => ({ date: b.bookingDate, price: b.totalPrice }))
    ];

    // Aggregate by day
    const dailyMap = new Map<string, { count: number; revenue: number }>();

    for (const booking of allBookings) {
      const date = booking.date.split('T')[0];
      const existing = dailyMap.get(date) || { count: 0, revenue: 0 };
      existing.count++;
      existing.revenue += booking.price;
      dailyMap.set(date, existing);
    }

    const daily = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Aggregate by week and month (simplified)
    const weeklyMap = new Map<string, { count: number; revenue: number }>();
    const monthlyMap = new Map<string, { count: number; revenue: number }>();

    for (const booking of allBookings) {
      const date = new Date(booking.date);
      const weekKey = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Week aggregation
      const weekData = weeklyMap.get(weekKey) || { count: 0, revenue: 0 };
      weekData.count++;
      weekData.revenue += booking.price;
      weeklyMap.set(weekKey, weekData);

      // Month aggregation
      const monthData = monthlyMap.get(monthKey) || { count: 0, revenue: 0 };
      monthData.count++;
      monthData.revenue += booking.price;
      monthlyMap.set(monthKey, monthData);
    }

    const weekly = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({ week, ...data }))
      .sort((a, b) => a.week.localeCompare(b.week));

    const monthly = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return { daily, weekly, monthly };
  }

  /**
   * Get popular flight routes
   */
  async getPopularRoutes(
    options: {
      limit?: number;
      dateRange?: DateRange;
    } = {}
  ): Promise<PopularRoute[]> {
    const queryOptions: any = {
      where: [
        { field: 'status', operator: '==', value: 'confirmed' }
      ]
    };

    if (options.dateRange) {
      queryOptions.where.push(
        { field: 'bookingDate', operator: '>=', value: options.dateRange.start },
        { field: 'bookingDate', operator: '<=', value: options.dateRange.end }
      );
    }

    const bookings = await bookingService.findAll(queryOptions);

    const routeMap = new Map<string, { count: number; totalRevenue: number; from: string; to: string }>();

    for (const booking of bookings) {
      const from = booking.flightDetails.departureAirport;
      const to = booking.flightDetails.arrivalAirport;
      const routeKey = `${from}-${to}`;

      const existing = routeMap.get(routeKey) || {
        count: 0,
        totalRevenue: 0,
        from,
        to
      };
      existing.count++;
      existing.totalRevenue += booking.totalPrice;
      routeMap.set(routeKey, existing);
    }

    return Array.from(routeMap.values())
      .map(route => ({
        ...route,
        averagePrice: route.totalRevenue / route.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, options.limit || 10);
  }

  /**
   * Get conversion rates
   */
  async getConversionRates(dateRange?: DateRange): Promise<{
    bookingConversionRate: number;
    applicationConversionRate: number;
    visaApprovalRate: number;
  }> {
    const [bookingStats, applicationStats, visaStats] = await Promise.all([
      bookingService.getStatistics(dateRange),
      applicationService.getStatistics(dateRange),
      visaApplicationService.getStatistics(dateRange)
    ]);

    return {
      bookingConversionRate: bookingStats.total > 0
        ? (bookingStats.confirmed / bookingStats.total) * 100
        : 0,
      applicationConversionRate: applicationStats.acceptanceRate,
      visaApprovalRate: visaStats.approvalRate
    };
  }

  /**
   * Get week number from date
   */
  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Get real-time statistics (summary only, no heavy queries)
   */
  async getRealtimeStatistics(): Promise<{
    activeUsers: number;
    pendingBookings: number;
    todayRevenue: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const [
      activeUsers,
      pendingBookings,
      todayRevenue
    ] = await Promise.all([
      userService.count({
        where: [{ field: 'isDisabled', operator: '==', value: false }]
      }),
      bookingService.count({
        where: [
          { field: 'status', operator: '==', value: 'pending' },
          { field: 'paymentStatus', operator: '==', value: 'pending' }
        ]
      }),
      this.getRevenueStatistics({ start: today, end: tomorrow })
    ]);

    return {
      activeUsers,
      pendingBookings,
      todayRevenue: todayRevenue.totalRevenue
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
