/**
 * Zod schemas for Study Abroad Application (Legacy) model validation
 */

import { z } from 'zod';

/**
 * Study Abroad Application Schema (Legacy/Alternative)
 * Simpler version for basic study abroad applications
 */
export const StudyAbroadApplicationSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  studentInfo: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    nationality: z.string().length(2).toUpperCase(),
  }),
  programPreferences: z.object({
    preferredCountries: z.array(z.string()),
    fieldOfStudy: z.string(),
    degreeLevel: z.enum(['bachelor', 'master', 'phd']),
    startTerm: z.string(),
    budgetRange: z.object({
      min: z.number().min(0),
      max: z.number().min(0),
      currency: z.string().length(3),
    }),
  }),
  academicBackground: z.object({
    currentEducationLevel: z.string(),
    institution: z.string(),
    gpa: z.number().min(0).max(5).optional(),
    expectedGraduation: z.string(),
  }),
  status: z.enum(['inquiry', 'consulting', 'applying', 'admitted', 'enrolled', 'cancelled']),
  assignedConsultant: z.string().optional(),
  notes: z.string().max(2000).optional(),
  submittedAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StudyAbroadApplicationData = z.infer<typeof StudyAbroadApplicationSchema>;
