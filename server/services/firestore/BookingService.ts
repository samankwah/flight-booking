/**
 * BookingService - Service for flight booking operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { Booking, IBooking } from '../../models/Booking.js';
import { BookingStatus, PaymentStatus } from '../../types/shared.js';

export class BookingService extends BaseService<IBooking, Booking> {
  protected modelClass = Booking;

  constructor() {
    super('bookings');
  }

  /**
   * Get all bookings for a specific user with pagination
   */
  async getUserBookings(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: BookingStatus;
      paymentStatus?: PaymentStatus;
    } = {}
  ): Promise<PaginatedResult<Booking>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    };

    // Add optional filters
    if (options.status) {
      queryOptions.where!.push({
        field: 'status',
        operator: '==',
        value: options.status
      });
    }

    if (options.paymentStatus) {
      queryOptions.where!.push({
        field: 'paymentStatus',
        operator: '==',
        value: options.paymentStatus
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get bookings by status with pagination (admin)
   */
  async getBookingsByStatus(
    status: BookingStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<Booking>> {
    return this.findPaginated({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get bookings by payment status with pagination (admin)
   */
  async getBookingsByPaymentStatus(
    paymentStatus: PaymentStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<Booking>> {
    return this.findPaginated({
      where: [{ field: 'paymentStatus', operator: '==', value: paymentStatus }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get bookings within a date range
   */
  async getBookingsByDateRange(
    startDate: string,
    endDate: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: BookingStatus;
    } = {}
  ): Promise<PaginatedResult<Booking>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'bookingDate', operator: '>=', value: startDate },
        { field: 'bookingDate', operator: '<=', value: endDate }
      ],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 100,
      startAfter: options.startAfter
    };

    if (options.status) {
      queryOptions.where!.push({
        field: 'status',
        operator: '==',
        value: options.status
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get upcoming bookings (not departed yet)
   */
  async getUpcomingBookings(
    userId?: string,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<Booking>> {
    const now = new Date().toISOString();

    const queryOptions: QueryOptions = {
      where: [
        { field: 'flightDetails.departureTime', operator: '>=', value: now },
        { field: 'status', operator: '==', value: 'confirmed' }
      ],
      orderBy: [{ field: 'flightDetails.departureTime', direction: 'asc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    };

    if (userId) {
      queryOptions.where!.push({
        field: 'userId',
        operator: '==',
        value: userId
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get past bookings
   */
  async getPastBookings(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<Booking>> {
    const now = new Date().toISOString();

    return this.findPaginated({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'flightDetails.departureTime', operator: '<', value: now }
      ],
      orderBy: [{ field: 'flightDetails.departureTime', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    });
  }

  /**
   * Get pending bookings (awaiting payment)
   */
  async getPendingBookings(
    options: {
      limit?: number;
      startAfter?: any;
      userId?: string;
    } = {}
  ): Promise<PaginatedResult<Booking>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'status', operator: '==', value: 'pending' },
        { field: 'paymentStatus', operator: '==', value: 'pending' }
      ],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (options.userId) {
      queryOptions.where!.push({
        field: 'userId',
        operator: '==',
        value: options.userId
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Search bookings by passenger name (case-insensitive)
   * Note: This uses client-side filtering for flexibility
   */
  async searchByPassengerName(
    searchTerm: string,
    options: {
      limit?: number;
      userId?: string;
    } = {}
  ): Promise<Booking[]> {
    const queryOptions: QueryOptions = {
      limit: options.limit || 100
    };

    if (options.userId) {
      queryOptions.where = [
        { field: 'userId', operator: '==', value: options.userId }
      ];
    }

    const bookings = await this.findAll(queryOptions);

    // Client-side filtering for flexible name search
    const searchLower = searchTerm.toLowerCase();
    return bookings.filter(booking => {
      const firstName = booking.passengerInfo.firstName.toLowerCase();
      const lastName = booking.passengerInfo.lastName.toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      return fullName.includes(searchLower);
    });
  }

  /**
   * Get bookings by booking reference
   */
  async getByBookingReference(bookingReference: string): Promise<Booking | null> {
    return this.findOne({
      where: [
        { field: 'bookingReference', operator: '==', value: bookingReference }
      ]
    });
  }

  /**
   * Mark booking as paid
   */
  async markAsPaid(
    bookingId: string,
    paymentReference: string,
    paymentMethod: string
  ): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const updatedBooking = booking.markAsPaid(paymentReference, paymentMethod);
    return this.update(bookingId, updatedBooking.toFirestore());
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.canCancel()) {
      throw new Error('Booking cannot be cancelled');
    }

    const cancelledBooking = booking.cancel(reason);
    return this.update(bookingId, cancelledBooking.toFirestore());
  }

  /**
   * Confirm a booking
   */
  async confirmBooking(bookingId: string): Promise<Booking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const confirmedBooking = booking.confirm();
    return this.update(bookingId, confirmedBooking.toFirestore());
  }

  /**
   * Get booking statistics (admin)
   */
  async getStatistics(dateRange?: { start: string; end: string }): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    paid: number;
    unpaid: number;
  }> {
    const queryOptions: QueryOptions = {};

    if (dateRange) {
      queryOptions.where = [
        { field: 'bookingDate', operator: '>=', value: dateRange.start },
        { field: 'bookingDate', operator: '<=', value: dateRange.end }
      ];
    }

    const bookings = await this.findAll(queryOptions);

    return {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      paid: bookings.filter(b => b.paymentStatus === 'paid').length,
      unpaid: bookings.filter(b => b.paymentStatus === 'pending').length
    };
  }

  /**
   * Get popular routes (admin)
   */
  async getPopularRoutes(limit: number = 10): Promise<Array<{
    route: string;
    count: number;
  }>> {
    const bookings = await this.findAll({
      where: [{ field: 'status', operator: '==', value: 'confirmed' }]
    });

    // Count bookings by route
    const routeCounts = new Map<string, number>();

    for (const booking of bookings) {
      const route = booking.getRoute();
      routeCounts.set(route, (routeCounts.get(route) || 0) + 1);
    }

    // Convert to array and sort
    return Array.from(routeCounts.entries())
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Subscribe to real-time updates for user bookings
   */
  subscribeToUserBookings(
    userId: string,
    callback: (bookings: Booking[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.onSnapshotQuery(
      {
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: [{ field: 'bookingDate', direction: 'desc' }],
        limit: 50
      },
      callback,
      errorCallback
    );
  }
}

// Export singleton instance
export const bookingService = new BookingService();
