/**
 * Booking Model - Flight booking representation
 */

import { BaseModel } from './BaseModel.js';
import {
  BookingSchema,
  FlightDetails,
  PassengerInfo,
  SelectedSeats,
  PriceBreakdown,
} from '../schemas/booking.schema.js';
import { IFirestoreDocument, BookingStatus, PaymentStatus } from '../types/shared.js';

export interface IBooking extends IFirestoreDocument {
  userId: string;
  flightDetails: FlightDetails;
  passengerInfo: PassengerInfo;
  selectedSeats?: SelectedSeats[];
  totalPrice: number;
  currency: string;
  priceBreakdown?: PriceBreakdown;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionReference?: string;
  bookingDate: string;
  bookingReference?: string;
  pnr?: string;
  confirmationNumber?: string;
  adminNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;
}

export class Booking extends BaseModel<IBooking> implements IBooking {
  userId: string;
  flightDetails: FlightDetails;
  passengerInfo: PassengerInfo;
  selectedSeats?: SelectedSeats[];
  totalPrice: number;
  currency: string;
  priceBreakdown?: PriceBreakdown;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionReference?: string;
  bookingDate: string;
  bookingReference?: string;
  pnr?: string;
  confirmationNumber?: string;
  adminNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;

  constructor(data: IBooking) {
    super(data);
    this.userId = data.userId;
    this.flightDetails = data.flightDetails;
    this.passengerInfo = data.passengerInfo;
    this.selectedSeats = data.selectedSeats;
    this.totalPrice = data.totalPrice;
    this.currency = data.currency;
    this.priceBreakdown = data.priceBreakdown;
    this.status = data.status;
    this.paymentStatus = data.paymentStatus;
    this.paymentMethod = data.paymentMethod;
    this.transactionReference = data.transactionReference;
    this.bookingDate = data.bookingDate;
    this.bookingReference = data.bookingReference;
    this.pnr = data.pnr;
    this.confirmationNumber = data.confirmationNumber;
    this.adminNotes = data.adminNotes;
    this.cancellationReason = data.cancellationReason;
    this.refundAmount = data.refundAmount;
    this.refundDate = data.refundDate;
  }

  /**
   * Validate booking data using Zod schema
   */
  validate(): void {
    BookingSchema.parse(this.toFirestore());
  }

  /**
   * Convert to Firestore document format
   */
  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      flightDetails: this.flightDetails,
      passengerInfo: this.passengerInfo,
      totalPrice: this.totalPrice,
      currency: this.currency,
      status: this.status,
      paymentStatus: this.paymentStatus,
      bookingDate: this.bookingDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Add optional fields if they exist
    if (this.selectedSeats) data.selectedSeats = this.selectedSeats;
    if (this.priceBreakdown) data.priceBreakdown = this.priceBreakdown;
    if (this.paymentMethod) data.paymentMethod = this.paymentMethod;
    if (this.transactionReference) data.transactionReference = this.transactionReference;
    if (this.bookingReference) data.bookingReference = this.bookingReference;
    if (this.pnr) data.pnr = this.pnr;
    if (this.confirmationNumber) data.confirmationNumber = this.confirmationNumber;
    if (this.adminNotes) data.adminNotes = this.adminNotes;
    if (this.cancellationReason) data.cancellationReason = this.cancellationReason;
    if (this.refundAmount !== undefined) data.refundAmount = this.refundAmount;
    if (this.refundDate) data.refundDate = this.refundDate;

    return data;
  }

  // ==================== Helper Methods ====================

  /**
   * Check if booking is confirmed
   */
  isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  /**
   * Check if booking is cancelled
   */
  isCancelled(): boolean {
    return this.status === 'cancelled';
  }

  /**
   * Check if booking is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if payment is completed
   */
  isPaid(): boolean {
    return this.paymentStatus === 'paid';
  }

  /**
   * Check if booking can be cancelled
   */
  canCancel(): boolean {
    return (
      (this.status === 'confirmed' || this.status === 'pending') &&
      this.paymentStatus !== 'refunded'
    );
  }

  /**
   * Check if booking can be refunded
   */
  canRefund(): boolean {
    return this.paymentStatus === 'paid' && this.status !== 'refunded';
  }

  /**
   * Get booking route (departure → arrival)
   */
  getRoute(): string {
    return `${this.flightDetails.departureAirport} → ${this.flightDetails.arrivalAirport}`;
  }

  /**
   * Get passenger full name
   */
  getPassengerName(): string {
    return `${this.passengerInfo.firstName} ${this.passengerInfo.lastName}`;
  }

  /**
   * Check if booking is international
   */
  isInternational(): boolean {
    return this.flightDetails.departureAirport.substring(0, 1) !==
           this.flightDetails.arrivalAirport.substring(0, 1);
  }

  /**
   * Get flight duration in hours
   */
  getDurationHours(): number {
    const departure = new Date(this.flightDetails.departureTime);
    const arrival = new Date(this.flightDetails.arrivalTime);
    return (arrival.getTime() - departure.getTime()) / (1000 * 60 * 60);
  }

  /**
   * Check if flight has already departed
   */
  hasDeparted(): boolean {
    return new Date(this.flightDetails.departureTime) < new Date();
  }

  /**
   * Get time until departure in milliseconds
   */
  getTimeUntilDeparture(): number {
    return new Date(this.flightDetails.departureTime).getTime() - Date.now();
  }

  /**
   * Check if booking needs payment (pending and not paid)
   */
  needsPayment(): boolean {
    return this.status === 'pending' && this.paymentStatus === 'pending';
  }

  // ==================== Static Factory Methods ====================

  /**
   * Create a new pending booking
   */
  static createNew(data: Omit<IBooking, 'id' | 'createdAt' | 'updatedAt' | 'bookingDate' | 'status' | 'paymentStatus'>): Booking {
    const now = new Date().toISOString();
    return new Booking({
      ...data,
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Create booking with confirmed status
   */
  static createConfirmed(data: Omit<IBooking, 'id' | 'createdAt' | 'updatedAt' | 'bookingDate' | 'status' | 'paymentStatus'>): Booking {
    const now = new Date().toISOString();
    return new Booking({
      ...data,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingDate: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Mark booking as paid
   */
  markAsPaid(transactionReference: string, paymentMethod: string): Booking {
    return this.withUpdates({
      paymentStatus: 'paid',
      status: 'confirmed',
      transactionReference,
      paymentMethod,
    } as Partial<IBooking>) as Booking;
  }

  /**
   * Cancel booking
   */
  cancel(reason?: string): Booking {
    return this.withUpdates({
      status: 'cancelled',
      cancellationReason: reason,
    } as Partial<IBooking>) as Booking;
  }

  /**
   * Refund booking
   */
  refund(refundAmount: number): Booking {
    return this.withUpdates({
      status: 'refunded',
      paymentStatus: 'refunded',
      refundAmount,
      refundDate: new Date().toISOString(),
    } as Partial<IBooking>) as Booking;
  }

  /**
   * Confirm booking
   */
  confirm(): Booking {
    return this.withUpdates({
      status: 'confirmed',
    } as Partial<IBooking>) as Booking;
  }

  /**
   * Mark booking as completed (after flight departure)
   */
  complete(): Booking {
    return this.withUpdates({
      status: 'completed',
    } as Partial<IBooking>) as Booking;
  }
}
