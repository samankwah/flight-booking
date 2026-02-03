/**
 * Zod schemas for Study Abroad Program model validation
 */

import { z } from 'zod';

const BasicInfoSchema = z.object({
  programName: z.string().min(1).max(300),
  universityId: z.string(),
  universityName: z.string(),
  country: z.string().length(2).toUpperCase(),
  city: z.string(),
  degree: z.enum(['bachelor', 'master', 'phd', 'diploma', 'certificate']),
  field: z.string().max(200),
  specialization: z.string().max(200).optional(),
  duration: z.string(),
  startDates: z.array(z.string()),
  language: z.string().default('English'),
});

const AcademicsSchema = z.object({
  description: z.string().max(2000),
  curriculum: z.array(z.string()),
  learningOutcomes: z.array(z.string()),
  accreditation: z.string().optional(),
  ranking: z.number().int().min(0).optional(),
});

const AdmissionSchema = z.object({
  requirements: z.array(z.string()),
  minimumGPA: z.number().min(0).max(5).optional(),
  englishRequirements: z.object({
    ielts: z.number().min(0).max(9).optional(),
    toefl: z.number().min(0).max(120).optional(),
    other: z.string().optional(),
  }).optional(),
  applicationDeadline: z.string(),
  intakeMonths: z.array(z.string()),
});

const FeesSchema = z.object({
  tuitionFee: z.number().min(0),
  applicationFee: z.number().min(0),
  currency: z.string().length(3).toUpperCase(),
  scholarshipsAvailable: z.boolean(),
  scholarshipDetails: z.string().optional(),
});

const CareerSchema = z.object({
  careerProspects: z.array(z.string()),
  averageSalary: z.number().min(0).optional(),
  salaryCurrency: z.string().length(3).optional(),
  employmentRate: z.number().min(0).max(100).optional(),
});

const SettingsSchema = z.object({
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  priority: z.number().int().min(0),
  capacity: z.number().int().min(0).optional(),
  enrolledStudents: z.number().int().min(0).optional(),
  createdAt: z.string().datetime(),
  lastUpdated: z.string().datetime(),
});

export const StudyAbroadProgramSchema = z.object({
  id: z.string().optional(),
  basicInfo: BasicInfoSchema,
  academics: AcademicsSchema,
  admission: AdmissionSchema,
  fees: FeesSchema,
  career: CareerSchema,
  settings: SettingsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type StudyAbroadProgramData = z.infer<typeof StudyAbroadProgramSchema>;
