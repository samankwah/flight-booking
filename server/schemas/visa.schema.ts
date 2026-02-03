/**
 * Zod schemas for Visa Application model validation
 */

import { z } from 'zod';

/**
 * Personal Information Schema
 */
export const PersonalInfoSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  middleName: z.string().max(100).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string().length(2).toUpperCase(),
  countryOfBirth: z.string().length(2).toUpperCase(),
  placeOfBirth: z.string().max(100),
  maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']),
  passportNumber: z.string().min(6).max(20),
  passportIssueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passportExpiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passportIssuingCountry: z.string().length(2).toUpperCase(),
});

/**
 * Contact Information Schema
 */
export const ContactInfoSchema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(20),
  alternativePhone: z.string().max(20).optional(),
  address: z.string().min(1).max(500),
  city: z.string().min(1).max(100),
  postalCode: z.string().max(20),
  country: z.string().length(2).toUpperCase(),
});

/**
 * Travel Details Schema
 */
export const TravelDetailsSchema = z.object({
  destinationCountry: z.string().length(2).toUpperCase(),
  purposeOfVisit: z.enum(['tourism', 'business', 'education', 'work', 'medical', 'transit', 'family_visit', 'other']),
  intendedArrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  intendedDepartureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  durationOfStay: z.number().int().min(1),
  portOfEntry: z.string().max(100),
  travelItinerary: z.string().max(1000).optional(),
  accommodationDetails: z.string().max(500).optional(),
});

/**
 * Employment Information Schema
 */
export const EmploymentInfoSchema = z.object({
  employmentStatus: z.enum(['employed', 'self_employed', 'student', 'retired', 'unemployed']),
  employer: z.string().max(200).optional(),
  occupation: z.string().max(100).optional(),
  monthlyIncome: z.number().min(0).optional(),
  currency: z.string().length(3).toUpperCase().optional(),
}).optional();

/**
 * Supporting Documents Schema
 */
export const SupportingDocumentsSchema = z.object({
  passportCopy: z.string().url(),
  photograph: z.string().url(),
  proofOfAccommodation: z.string().url().optional(),
  flightTicket: z.string().url().optional(),
  bankStatement: z.string().url().optional(),
  employmentLetter: z.string().url().optional(),
  invitationLetter: z.string().url().optional(),
  travelInsurance: z.string().url().optional(),
  additionalDocuments: z.array(z.string().url()).optional(),
}).optional();

/**
 * Main Visa Application Schema
 */
export const VisaApplicationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  personalInfo: PersonalInfoSchema,
  contactInfo: ContactInfoSchema,
  travelDetails: TravelDetailsSchema,
  employmentInfo: EmploymentInfoSchema.optional(),
  supportingDocuments: SupportingDocumentsSchema.optional(),
  type: z.enum(['tourist', 'business', 'student', 'work', 'transit', 'family', 'medical']),
  visaDuration: z.enum(['single_entry', 'multiple_entry', '30_days', '90_days', '180_days', '1_year', '5_years']),
  status: z.enum(['submitted', 'processing', 'approved', 'rejected', 'cancelled']),
  applicationNumber: z.string().optional(),
  submittedAt: z.string().datetime(),
  processingStartedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  rejectionReason: z.string().max(500).optional(),
  adminNotes: z.string().max(1000).optional(),
  fees: z.object({
    applicationFee: z.number().min(0),
    processingFee: z.number().min(0).optional(),
    total: z.number().min(0),
    currency: z.string().length(3).toUpperCase(),
    paid: z.boolean(),
    transactionReference: z.string().optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Type inference from schemas
 */
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type ContactInfo = z.infer<typeof ContactInfoSchema>;
export type TravelDetails = z.infer<typeof TravelDetailsSchema>;
export type EmploymentInfo = z.infer<typeof EmploymentInfoSchema>;
export type SupportingDocuments = z.infer<typeof SupportingDocumentsSchema>;
export type VisaApplicationData = z.infer<typeof VisaApplicationSchema>;
