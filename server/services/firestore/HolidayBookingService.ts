/**
 * HolidayBookingService - Service for holiday package booking operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { HolidayPackageBooking, IHolidayPackageBooking } from '../../models/HolidayPackageBooking.js';
import { BookingStatus, PaymentStatus } from '../../types/shared.js';

export class HolidayBookingService extends BaseService<IHolidayPackageBooking, HolidayPackageBooking> {
  protected modelClass = HolidayPackageBooking;

  constructor() {
    super('holidayPackageBookings');
  }

  /**
   * Get all holiday bookings for a specific user with pagination
   */
  async getUserBookings(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: BookingStatus;
      paymentStatus?: PaymentStatus;
    } = {}
  ): Promise<PaginatedResult<HolidayPackageBooking>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    };

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
   * Get holiday bookings by status with pagination (admin)
   */
  async getBookingsByStatus(
    status: BookingStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HolidayPackageBooking>> {
    return this.findPaginated({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get holiday bookings by payment status with pagination (admin)
   */
  async getBookingsByPaymentStatus(
    paymentStatus: PaymentStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HolidayPackageBooking>> {
    return this.findPaginated({
      where: [{ field: 'paymentStatus', operator: '==', value: paymentStatus }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get upcoming holiday bookings (future travel dates)
   */
  async getUpcomingBookings(
    userId?: string,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HolidayPackageBooking>> {
    const today = new Date().toISOString().split('T')[0];

    const queryOptions: QueryOptions = {
      where: [
        { field: 'travelDates.startDate', operator: '>=', value: today },
        { field: 'status', operator: '==', value: 'confirmed' }
      ],
      orderBy: [{ field: 'travelDates.startDate', direction: 'asc' }],
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
   * Get current holiday bookings (travelers currently on trip)
   */
  async getCurrentBookings(
    options: {
      limit?: number;
      userId?: string;
    } = {}
  ): Promise<HolidayPackageBooking[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'status', operator: '==', value: 'confirmed' }
      ],
      limit: options.limit || 100
    };

    if (options.userId) {
      queryOptions.where!.push({
        field: 'userId',
        operator: '==',
        value: options.userId
      });
    }

    const bookings = await this.findAll(queryOptions);

    // Client-side filtering for current trips
    return bookings.filter(booking => booking.isCurrentlyOnTrip());
  }

  /**
   * Get past holiday bookings
   */
  async getPastBookings(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HolidayPackageBooking>> {
    const today = new Date().toISOString().split('T')[0];

    return this.findPaginated({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'travelDates.endDate', operator: '<', value: today }
      ],
      orderBy: [{ field: 'travelDates.endDate', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    });
  }

  /**
   * Get holiday bookings by date range
   */
  async getBookingsByDateRange(
    startDate: string,
    endDate: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: BookingStatus;
    } = {}
  ): Promise<PaginatedResult<HolidayPackageBooking>> {
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
   * Get holiday booking by booking reference
   */
  async getByBookingReference(bookingReference: string): Promise<HolidayPackageBooking | null> {
    return this.findOne({
      where: [
        { field: 'bookingReference', operator: '==', value: bookingReference }
      ]
    });
  }

  /**
   * Mark holiday booking as paid
   */
  async markAsPaid(
    bookingId: string,
    paymentReference: string,
    paymentMethod: string
  ): Promise<HolidayPackageBooking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Holiday booking not found');
    }

    const updatedBooking = booking.markAsPaid(paymentReference, paymentMethod);
    return this.update(bookingId, updatedBooking.toFirestore());
  }

  /**
   * Cancel a holiday booking
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<HolidayPackageBooking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Holiday booking not found');
    }

    if (!booking.canCancel()) {
      throw new Error('Holiday booking cannot be cancelled (within 7 days of travel)');
    }

    const cancelledBooking = booking.cancel(reason);
    return this.update(bookingId, cancelledBooking.toFirestore());
  }

  /**
   * Confirm a holiday booking
   */
  async confirmBooking(bookingId: string): Promise<HolidayPackageBooking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Holiday booking not found');
    }

    const confirmedBooking = booking.confirm();
    return this.update(bookingId, confirmedBooking.toFirestore());
  }

  /**
   * Add travelers to booking
   */
  async addTravelers(
    bookingId: string,
    travelers: IHolidayPackageBooking['travelerInfo']['travelers']
  ): Promise<HolidayPackageBooking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Holiday booking not found');
    }

    const updatedBooking = booking.addTraveler(travelers[0]);
    return this.update(bookingId, updatedBooking.toFirestore());
  }

  /**
   * Get holiday booking statistics (admin)
   */
  async getStatistics(dateRange?: { start: string; end: string }): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    paid: number;
    unpaid: number;
    totalTravelers: number;
    totalDays: number;
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
      unpaid: bookings.filter(b => b.paymentStatus === 'pending').length,
      totalTravelers: bookings.reduce((sum, b) => sum + b.getTravelerCount(), 0),
      totalDays: bookings.reduce((sum, b) => sum + b.getDuration(), 0)
    };
  }

  /**
   * Subscribe to real-time updates for user holiday bookings
   */
  subscribeToUserBookings(
    userId: string,
    callback: (bookings: HolidayPackageBooking[]) => void,
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
export const holidayBookingService = new HolidayBookingService();
