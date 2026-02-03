/**
 * HolidayPackageBooking Model - Holiday package reservation representation
 */

import { BaseModel } from './BaseModel.js';
import {
  HolidayPackageBookingSchema,
  PackageDetails,
  TravelerInfo,
  TravelDates,
} from '../schemas/holiday.schema.js';
import { IFirestoreDocument, BookingStatus, PaymentStatus } from '../types/shared.js';

export interface IHolidayPackageBooking extends IFirestoreDocument {
  userId: string;
  packageDetails: PackageDetails;
  travelerInfo: TravelerInfo;
  travelDates: TravelDates;
  totalPrice: number;
  currency: string;
  depositAmount?: number;
  depositPaid?: boolean;
  status: BookingStatus;
  paymentStatus: PaymentStatus | 'partial';
  paymentMethod?: string;
  transactionReference?: string;
  bookingDate: string;
  bookingReference?: string;
  confirmationNumber?: string;
  voucherUrl?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    required: boolean;
    purchased?: boolean;
    provider?: string;
    policyNumber?: string;
  };
  adminNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;
}

export class HolidayPackageBooking extends BaseModel<IHolidayPackageBooking> implements IHolidayPackageBooking {
  userId!: string;
  packageDetails!: PackageDetails;
  travelerInfo!: TravelerInfo;
  travelDates!: TravelDates;
  totalPrice!: number;
  currency!: string;
  depositAmount?: number;
  depositPaid?: boolean;
  status!: BookingStatus;
  paymentStatus!: PaymentStatus | 'partial';
  paymentMethod?: string;
  transactionReference?: string;
  bookingDate!: string;
  bookingReference?: string;
  confirmationNumber?: string;
  voucherUrl?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    required: boolean;
    purchased?: boolean;
    provider?: string;
    policyNumber?: string;
  };
  adminNotes?: string;
  cancellationReason?: string;
  refundAmount?: number;
  refundDate?: string;

  constructor(data: IHolidayPackageBooking) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    HolidayPackageBookingSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      packageDetails: this.packageDetails,
      travelerInfo: this.travelerInfo,
      travelDates: this.travelDates,
      totalPrice: this.totalPrice,
      currency: this.currency,
      status: this.status,
      paymentStatus: this.paymentStatus,
      bookingDate: this.bookingDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    // Add optional fields
    if (this.depositAmount !== undefined) data.depositAmount = this.depositAmount;
    if (this.depositPaid !== undefined) data.depositPaid = this.depositPaid;
    if (this.paymentMethod) data.paymentMethod = this.paymentMethod;
    if (this.transactionReference) data.transactionReference = this.transactionReference;
    if (this.bookingReference) data.bookingReference = this.bookingReference;
    if (this.confirmationNumber) data.confirmationNumber = this.confirmationNumber;
    if (this.voucherUrl) data.voucherUrl = this.voucherUrl;
    if (this.emergencyContact) data.emergencyContact = this.emergencyContact;
    if (this.insurance) data.insurance = this.insurance;
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

  getTotalTravelers(): number {
    return this.travelerInfo.adults + this.travelerInfo.children + this.travelerInfo.infants;
  }

  getPricePerPerson(): number {
    const totalTravelers = this.getTotalTravelers();
    return totalTravelers > 0 ? this.totalPrice / totalTravelers : this.totalPrice;
  }

  hasStarted(): boolean {
    return new Date(this.travelDates.startDate) < new Date();
  }

  hasEnded(): boolean {
    return new Date(this.travelDates.endDate) < new Date();
  }

  needsInsurance(): boolean {
    return this.insurance?.required === true && !this.insurance?.purchased;
  }

  canCancel(): boolean {
    // Can cancel up to 7 days before departure
    const startDate = new Date(this.travelDates.startDate);
    const now = new Date();
    const daysUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilStart > 7 && this.status !== 'cancelled' && this.status !== 'completed';
  }

  cancel(reason?: string): HolidayPackageBooking {
    return this.withUpdates({
      status: 'cancelled',
      cancellationReason: reason,
      updatedAt: new Date().toISOString()
    }) as HolidayPackageBooking;
  }

  confirm(): HolidayPackageBooking {
    return this.withUpdates({
      status: 'confirmed',
      updatedAt: new Date().toISOString()
    }) as HolidayPackageBooking;
  }

  markAsPaid(transactionRef: string, method: string): HolidayPackageBooking {
    return this.withUpdates({
      paymentStatus: 'paid',
      transactionReference: transactionRef,
      paymentMethod: method,
      updatedAt: new Date().toISOString()
    }) as HolidayPackageBooking;
  }

  isCurrentlyOnTrip(): boolean {
    const now = new Date();
    const start = new Date(this.travelDates.startDate);
    const end = new Date(this.travelDates.endDate);
    return now >= start && now <= end;
  }

  getDuration(): number {
    const start = new Date(this.travelDates.startDate);
    const end = new Date(this.travelDates.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  getTravelerCount(): number {
    return this.getTotalTravelers();
  }

  addTraveler(traveler: any): HolidayPackageBooking {
    const additionalTravelers = this.travelerInfo.additionalTravelers || [];
    return this.withUpdates({
      travelerInfo: {
        ...this.travelerInfo,
        additionalTravelers: [...additionalTravelers, traveler]
      },
      updatedAt: new Date().toISOString()
    }) as HolidayPackageBooking;
  }

  static createNew(data: Omit<IHolidayPackageBooking, 'id' | 'createdAt' | 'updatedAt' | 'bookingDate' | 'status' | 'paymentStatus'>): HolidayPackageBooking {
    const now = new Date().toISOString();
    return new HolidayPackageBooking({
      ...data,
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: now,
      createdAt: now,
      updatedAt: now,
    });
  }
}
