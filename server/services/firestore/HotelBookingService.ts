/**
 * HotelBookingService - Service for hotel booking operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { HotelBooking, IHotelBooking } from '../../models/HotelBooking.js';
import { BookingStatus, PaymentStatus } from '../../types/shared.js';

export class HotelBookingService extends BaseService<IHotelBooking, HotelBooking> {
  protected modelClass = HotelBooking;

  constructor() {
    super('hotelBookings');
  }

  /**
   * Get all hotel bookings for a specific user with pagination
   */
  async getUserBookings(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: BookingStatus;
      paymentStatus?: PaymentStatus;
    } = {}
  ): Promise<PaginatedResult<HotelBooking>> {
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
   * Get hotel bookings by status with pagination (admin)
   */
  async getBookingsByStatus(
    status: BookingStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HotelBooking>> {
    return this.findPaginated({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get hotel bookings by payment status with pagination (admin)
   */
  async getBookingsByPaymentStatus(
    paymentStatus: PaymentStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HotelBooking>> {
    return this.findPaginated({
      where: [{ field: 'paymentStatus', operator: '==', value: paymentStatus }],
      orderBy: [{ field: 'bookingDate', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get upcoming hotel bookings (future check-in dates)
   */
  async getUpcomingBookings(
    userId?: string,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HotelBooking>> {
    const today = new Date().toISOString().split('T')[0];

    const queryOptions: QueryOptions = {
      where: [
        { field: 'bookingDates.checkIn', operator: '>=', value: today },
        { field: 'status', operator: '==', value: 'confirmed' }
      ],
      orderBy: [{ field: 'bookingDates.checkIn', direction: 'asc' }],
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
   * Get current hotel bookings (guests currently checked in)
   */
  async getCurrentBookings(
    options: {
      limit?: number;
      startAfter?: any;
      userId?: string;
    } = {}
  ): Promise<HotelBooking[]> {
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

    // Client-side filtering for current bookings
    return bookings.filter(booking => booking.isCurrentlyCheckedIn());
  }

  /**
   * Get past hotel bookings
   */
  async getPastBookings(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<HotelBooking>> {
    const today = new Date().toISOString().split('T')[0];

    return this.findPaginated({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'bookingDates.checkOut', operator: '<', value: today }
      ],
      orderBy: [{ field: 'bookingDates.checkOut', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    });
  }

  /**
   * Get hotel bookings by date range
   */
  async getBookingsByDateRange(
    startDate: string,
    endDate: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: BookingStatus;
    } = {}
  ): Promise<PaginatedResult<HotelBooking>> {
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
   * Get hotel booking by confirmation number
   */
  async getByConfirmationNumber(confirmationNumber: string): Promise<HotelBooking | null> {
    return this.findOne({
      where: [
        { field: 'confirmationNumber', operator: '==', value: confirmationNumber }
      ]
    });
  }

  /**
   * Mark hotel booking as paid
   */
  async markAsPaid(
    bookingId: string,
    paymentReference: string,
    paymentMethod: string
  ): Promise<HotelBooking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Hotel booking not found');
    }

    const updatedBooking = booking.markAsPaid(paymentReference, paymentMethod);
    return this.update(bookingId, updatedBooking.toFirestore());
  }

  /**
   * Cancel a hotel booking
   */
  async cancelBooking(
    bookingId: string,
    reason?: string
  ): Promise<HotelBooking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Hotel booking not found');
    }

    if (!booking.canCancel()) {
      throw new Error('Hotel booking cannot be cancelled (within 48 hours of check-in)');
    }

    const cancelledBooking = booking.cancel(reason);
    return this.update(bookingId, cancelledBooking.toFirestore());
  }

  /**
   * Confirm a hotel booking
   */
  async confirmBooking(bookingId: string): Promise<HotelBooking> {
    const booking = await this.findById(bookingId);
    if (!booking) {
      throw new Error('Hotel booking not found');
    }

    const confirmedBooking = booking.confirm();
    return this.update(bookingId, confirmedBooking.toFirestore());
  }

  /**
   * Get hotel booking statistics (admin)
   */
  async getStatistics(dateRange?: { start: string; end: string }): Promise<{
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    paid: number;
    unpaid: number;
    totalNights: number;
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
      totalNights: bookings.reduce((sum, b) => sum + b.getNights(), 0)
    };
  }

  /**
   * Subscribe to real-time updates for user hotel bookings
   */
  subscribeToUserBookings(
    userId: string,
    callback: (bookings: HotelBooking[]) => void,
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
export const hotelBookingService = new HotelBookingService();
