/**
 * Zod schemas for Study Abroad Application model validation
 */

import { z } from 'zod';

const ApplicantSchema = z.object({
  userId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  nationality: z.string().length(2),
  passportNumber: z.string().optional(),
});

const UniversityRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  city: z.string(),
});

const ProgramRefSchema = z.object({
  id: z.string(),
  name: z.string(),
  degree: z.string(),
  duration: z.string(),
  fees: z.object({
    amount: z.number(),
    currency: z.string(),
  }),
});

const AcademicsSchema = z.object({
  highestQualification: z.string(),
  institution: z.string(),
  gpa: z.number().min(0).max(5).optional(),
  graduationYear: z.number().int(),
  transcriptUrl: z.string().url().optional(),
});

const DocumentsSchema = z.object({
  transcript: z.object({ uploaded: z.boolean(), verified: z.boolean(), url: z.string().optional() }),
  passport: z.object({ uploaded: z.boolean(), verified: z.boolean(), url: z.string().optional() }),
  recommendation: z.object({ uploaded: z.boolean(), verified: z.boolean(), url: z.string().optional() }),
  sop: z.object({ uploaded: z.boolean(), verified: z.boolean(), url: z.string().optional() }),
  englishTest: z.object({ uploaded: z.boolean(), verified: z.boolean(), url: z.string().optional() }),
});

const WorkflowSchema = z.object({
  status: z.enum(['draft', 'submitted', 'under_review', 'approved', 'rejected', 'withdrawn']),
  submittedAt: z.string().datetime().optional(),
  reviewedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.string().optional(),
});

export const ApplicationSchema = z.object({
  id: z.string().optional(),
  applicant: ApplicantSchema,
  university: UniversityRefSchema,
  program: ProgramRefSchema,
  academics: AcademicsSchema,
  documents: DocumentsSchema,
  workflow: WorkflowSchema,
  payment: z.object({
    applicationFee: z.number(),
    currency: z.string(),
    paid: z.boolean(),
    transactionReference: z.string().optional(),
  }),
  communications: z.array(z.object({
    from: z.string(),
    message: z.string(),
    timestamp: z.string().datetime(),
  })).optional(),
  timeline: z.array(z.object({
    event: z.string(),
    timestamp: z.string().datetime(),
    actor: z.string().optional(),
  })).optional(),
  adminNotes: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ApplicationData = z.infer<typeof ApplicationSchema>;
