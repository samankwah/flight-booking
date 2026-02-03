/**
 * Zod schemas for Hotel Booking model validation
 */

import { z } from 'zod';

/**
 * Hotel Details Schema
 */
export const HotelDetailsSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  country: z.string().length(2).toUpperCase(),
  postalCode: z.string().max(20).optional(),
  starRating: z.number().min(1).max(5),
  phone: z.string().max(50).optional(),
  email: z.string().email().optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
});

/**
 * Room Details Schema
 */
export const RoomDetailsSchema = z.object({
  roomType: z.string().min(1).max(100),
  roomNumber: z.string().max(20).optional(),
  numberOfGuests: z.number().int().min(1).max(10),
  bedType: z.string().max(50).optional(),
  roomSize: z.string().optional(),
  view: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  pricePerNight: z.number().min(0),
});

/**
 * Guest Information Schema
 */
export const GuestInfoSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  country: z.string().length(2).toUpperCase(),
  specialRequests: z.string().max(500).optional(),
  loyaltyNumber: z.string().max(50).optional(),
});

/**
 * Booking Dates Schema
 */
export const BookingDatesSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  numberOfNights: z.number().int().min(1),
});

/**
 * Main Hotel Booking Schema
 */
export const HotelBookingSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  hotelDetails: HotelDetailsSchema,
  roomDetails: RoomDetailsSchema,
  guestInfo: GuestInfoSchema,
  bookingDates: BookingDatesSchema,
  totalPrice: z.number().positive(),
  currency: z.string().length(3).toUpperCase(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  paymentMethod: z.string().optional(),
  transactionReference: z.string().optional(),
  bookingDate: z.string().datetime(),
  bookingReference: z.string().optional(),
  confirmationNumber: z.string().optional(),
  type: z.enum(['hotel', 'resort', 'apartment', 'villa', 'hostel']).optional(),
  includesBreakfast: z.boolean().optional(),
  cancellationPolicy: z.string().optional(),
  adminNotes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
  refundAmount: z.number().min(0).optional(),
  refundDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Type inference from schemas
 */
export type HotelDetails = z.infer<typeof HotelDetailsSchema>;
export type RoomDetails = z.infer<typeof RoomDetailsSchema>;
export type GuestInfo = z.infer<typeof GuestInfoSchema>;
export type BookingDates = z.infer<typeof BookingDatesSchema>;
export type HotelBookingData = z.infer<typeof HotelBookingSchema>;
