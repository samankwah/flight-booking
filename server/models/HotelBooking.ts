/**
 * HotelBooking Model - Hotel reservation representation
 */

import { BaseModel } from './BaseModel.js';
import {
  HotelBookingSchema,
  HotelDetails,
  RoomDetails,
  GuestInfo,
  BookingDates,
} from '../schemas/hotel.schema.js';
import { IFirestoreDocument, BookingStatus, PaymentStatus } from '../types/shared.js';

export interface IHotelBooking extends IFirestoreDocument {
  userId: string;
  hotelDetails: HotelDetails;
  roomDetails: RoomDetails;
  guestInfo: GuestInfo;
  bookingDates: BookingDates;
  totalPrice: number;
  currency: string;
  status: BookingStatus | 'no_show';
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionReference?: string;
  bookingDate: string;
  bookingReference?: string;
  confirmationNumber?: string;
  type?: 'hotel' | 'resort' | 'apartment' | 'villa' | 'hostel';
  includesBreakfast?: boolean;
  cancellationPolicy?: string;
  adminNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;
}

export class HotelBooking extends BaseModel<IHotelBooking> implements IHotelBooking {
  userId: string;
  hotelDetails: HotelDetails;
  roomDetails: RoomDetails;
  guestInfo: GuestInfo;
  bookingDates: BookingDates;
  totalPrice: number;
  currency: string;
  status: BookingStatus | 'no_show';
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionReference?: string;
  bookingDate: string;
  bookingReference?: string;
  confirmationNumber?: string;
  type?: 'hotel' | 'resort' | 'apartment' | 'villa' | 'hostel';
  includesBreakfast?: boolean;
  cancellationPolicy?: string;
  adminNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;

  constructor(data: IHotelBooking) {
    super(data);
    this.userId = data.userId;
    this.hotelDetails = data.hotelDetails;
    this.roomDetails = data.roomDetails;
    this.guestInfo = data.guestInfo;
    this.bookingDates = data.bookingDates;
    this.totalPrice = data.totalPrice;
    this.currency = data.currency;
    this.status = data.status;
    this.paymentStatus = data.paymentStatus;
    this.paymentMethod = data.paymentMethod;
    this.transactionReference = data.transactionReference;
    this.bookingDate = data.bookingDate;
    this.bookingReference = data.bookingReference;
    this.confirmationNumber = data.confirmationNumber;
    this.type = data.type;
    this.includesBreakfast = data.includesBreakfast;
    this.cancellationPolicy = data.cancellationPolicy;
    this.adminNotes = data.adminNotes;
    this.cancellationReason = data.cancellationReason;
    this.refundAmount = data.refundAmount;
    this.refundDate = data.refundDate;
  }

  validate(): void {
    HotelBookingSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      hotelDetails: this.hotelDetails,
      roomDetails: this.roomDetails,
      guestInfo: this.guestInfo,
      bookingDates: this.bookingDates,
      totalPrice: this.totalPrice,
      currency: this.currency,
      status: this.status,
      paymentStatus: this.paymentStatus,
      bookingDate: this.bookingDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.paymentMethod) data.paymentMethod = this.paymentMethod;
    if (this.transactionReference) data.transactionReference = this.transactionReference;
    if (this.bookingReference) data.bookingReference = this.bookingReference;
    if (this.confirmationNumber) data.confirmationNumber = this.confirmationNumber;
    if (this.type) data.type = this.type;
    if (this.includesBreakfast !== undefined) data.includesBreakfast = this.includesBreakfast;
    if (this.cancellationPolicy) data.cancellationPolicy = this.cancellationPolicy;
    if (this.adminNotes) data.adminNotes = this.adminNotes;
    if (this.cancellationReason) data.cancellationReason = this.cancellationReason;
    if (this.refundAmount !== undefined) data.refundAmount = this.refundAmount;
    if (this.refundDate) data.refundDate = this.refundDate;

    return data;
  }

  // Helper methods
  isConfirmed(): boolean {
    return this.status === 'confirmed';
  }

  isPaid(): boolean {
    return this.paymentStatus === 'paid';
  }

  canCancel(): boolean {
    return (this.status === 'confirmed' || this.status === 'pending') &&
           this.paymentStatus !== 'refunded';
  }

  getGuestName(): string {
    return `${this.guestInfo.firstName} ${this.guestInfo.lastName}`;
  }

  getTotalNights(): number {
    return this.bookingDates.numberOfNights;
  }

  getPricePerNight(): number {
    return this.totalPrice / this.bookingDates.numberOfNights;
  }

  hasCheckedIn(): boolean {
    return new Date(this.bookingDates.checkIn) < new Date();
  }

  hasCheckedOut(): boolean {
    return new Date(this.bookingDates.checkOut) < new Date();
  }

  cancel(reason?: string): HotelBooking {
    return this.withUpdates({
      status: 'cancelled',
      cancellationReason: reason,
      updatedAt: new Date().toISOString()
    }) as HotelBooking;
  }

  confirm(): HotelBooking {
    return this.withUpdates({
      status: 'confirmed',
      updatedAt: new Date().toISOString()
    }) as HotelBooking;
  }

  markAsPaid(transactionRef: string, method: string): HotelBooking {
    return this.withUpdates({
      paymentStatus: 'paid',
      transactionReference: transactionRef,
      paymentMethod: method,
      updatedAt: new Date().toISOString()
    }) as HotelBooking;
  }

  isCurrentlyCheckedIn(): boolean {
    const now = new Date();
    const checkIn = new Date(this.bookingDates.checkIn);
    const checkOut = new Date(this.bookingDates.checkOut);
    return now >= checkIn && now < checkOut;
  }

  getNights(): number {
    return this.bookingDates.numberOfNights;
  }

  static createNew(data: Omit<IHotelBooking, 'id' | 'createdAt' | 'updatedAt' | 'bookingDate' | 'status' | 'paymentStatus'>): HotelBooking {
    const now = new Date().toISOString();
    return new HotelBooking({
      ...data,
      status: 'confirmed',
      paymentStatus: 'pending',
      bookingDate: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}
