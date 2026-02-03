/**
 * Zod schemas for Booking model validation
 */

import { z } from 'zod';

/**
 * Flight Details Schema
 */
export const FlightDetailsSchema = z.object({
  flightNumber: z.string().min(1).max(10),
  airline: z.string().min(1).max(100),
  departureAirport: z.string().length(3).toUpperCase(), // IATA code
  arrivalAirport: z.string().length(3).toUpperCase(), // IATA code
  departureTime: z.string().datetime(),
  arrivalTime: z.string().datetime(),
  duration: z.string(),
  stops: z.number().int().min(0).max(5),
  cabin: z.enum(['economy', 'premium_economy', 'business', 'first']),
  aircraft: z.string().optional(),
  terminal: z.string().optional(),
});

/**
 * Passenger Information Schema
 */
export const PassengerInfoSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  passportNumber: z.string().min(6).max(20).optional(),
  nationality: z.string().length(2).toUpperCase(), // ISO country code
  frequentFlyerNumber: z.string().max(50).optional(),
});

/**
 * Selected Seats Schema (if applicable)
 */
export const SelectedSeatsSchema = z.object({
  seatNumber: z.string(),
  seatClass: z.string(),
  price: z.number().min(0).optional(),
}).optional();

/**
 * Price Breakdown Schema
 */
export const PriceBreakdownSchema = z.object({
  baseFare: z.number().min(0),
  taxes: z.number().min(0),
  fees: z.number().min(0),
  discount: z.number().min(0).optional(),
  total: z.number().min(0),
});

/**
 * Main Booking Schema
 */
export const BookingSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  flightDetails: FlightDetailsSchema,
  passengerInfo: PassengerInfoSchema,
  selectedSeats: z.array(SelectedSeatsSchema).optional(),
  totalPrice: z.number().positive(),
  currency: z.string().length(3).toUpperCase(), // ISO currency code
  priceBreakdown: PriceBreakdownSchema.optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'refunded']),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
  paymentMethod: z.string().optional(),
  transactionReference: z.string().optional(),
  bookingDate: z.string().datetime(),
  bookingReference: z.string().optional(),
  pnr: z.string().optional(), // Passenger Name Record
  confirmationNumber: z.string().optional(),
  adminNotes: z.string().max(1000).optional(),
  cancellationReason: z.string().max(500).optional(),
  refundAmount: z.number().min(0).optional(),
  refundDate: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Booking Creation Schema (for API requests)
 * Omits fields that are set automatically (id, dates, status)
 */
export const BookingCreateSchema = BookingSchema.omit({
  id: true,
  bookingDate: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  paymentStatus: true,
});

/**
 * Booking Update Schema (for API requests)
 * Allows partial updates
 */
export const BookingUpdateSchema = BookingSchema.partial().omit({
  id: true,
  userId: true,
  createdAt: true,
});

/**
 * Type inference from schemas
 */
export type FlightDetails = z.infer<typeof FlightDetailsSchema>;
export type PassengerInfo = z.infer<typeof PassengerInfoSchema>;
export type SelectedSeats = z.infer<typeof SelectedSeatsSchema>;
export type PriceBreakdown = z.infer<typeof PriceBreakdownSchema>;
export type BookingData = z.infer<typeof BookingSchema>;
export type BookingCreateData = z.infer<typeof BookingCreateSchema>;
export type BookingUpdateData = z.infer<typeof BookingUpdateSchema>;
