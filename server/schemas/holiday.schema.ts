/**
 * Zod schemas for Holiday Package Booking model validation
 */

import { z } from 'zod';

/**
 * Package Details Schema
 */
export const PackageDetailsSchema = z.object({
  packageName: z.string().min(1).max(200),
  destination: z.string().min(1).max(200),
  duration: z.number().int().min(1),
  durationUnit: z.enum(['days', 'nights']),
  description: z.string().max(2000),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  accommodationType: z.enum(['hotel', 'resort', 'cruise', 'villa', 'mixed']),
  mealPlan: z.enum(['none', 'breakfast', 'half_board', 'full_board', 'all_inclusive']).optional(),
  transportIncluded: z.boolean(),
  tourGuide: z.boolean().optional(),
  images: z.array(z.string().url()).optional(),
});

/**
 * Traveler Information Schema
 */
export const TravelerInfoSchema = z.object({
  adults: z.number().int().min(1).max(20),
  children: z.number().int().min(0).max(10),
  infants: z.number().int().min(0).max(5),
  leadTraveler: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    country: z.string().length(2).toUpperCase(),
  }),
  additionalTravelers: z.array(z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    age: z.number().int().min(0).max(120).optional(),
  })).optional(),
  specialRequests: z.string().max(500).optional(),
});

/**
 * Travel Dates Schema
 */
export const TravelDatesSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  flexible: z.boolean().optional(),
});

/**
 * Main Holiday Package Booking Schema
 */
export const HolidayPackageBookingSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  packageDetails: PackageDetailsSchema,
  travelerInfo: TravelerInfoSchema,
  travelDates: TravelDatesSchema,
  totalPrice: z.number().positive(),
  currency: z.string().length(3).toUpperCase(),
  depositAmount: z.number().min(0).optional(),
  depositPaid: z.boolean().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'failed', 'refunded']),
  paymentMethod: z.string().optional(),
  transactionReference: z.string().optional(),
  bookingDate: z.string().datetime(),
  bookingReference: z.string().optional(),
  confirmationNumber: z.string().optional(),
  voucherUrl: z.string().url().optional(),
  emergencyContact: z.object({
    name: z.string().max(100),
    phone: z.string().max(20),
    relationship: z.string().max(50),
  }).optional(),
  insurance: z.object({
    required: z.boolean(),
    purchased: z.boolean().optional(),
    provider: z.string().optional(),
    policyNumber: z.string().optional(),
  }).optional(),
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
export type PackageDetails = z.infer<typeof PackageDetailsSchema>;
export type TravelerInfo = z.infer<typeof TravelerInfoSchema>;
export type TravelDates = z.infer<typeof TravelDatesSchema>;
export type HolidayPackageBookingData = z.infer<typeof HolidayPackageBookingSchema>;
