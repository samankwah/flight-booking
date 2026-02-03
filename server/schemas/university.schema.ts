/**
 * Zod schemas for University model validation
 */

import { z } from 'zod';

export const BasicInfoSchema = z.object({
  name: z.string().min(1).max(500),
  country: z.string().min(2).max(100),
  city: z.string().min(1).max(100),
  address: z.string().max(500),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().max(50),
  email: z.string().email(),
});

export const RankingSchema = z.object({
  world: z.number().int().min(0),
  national: z.number().int().min(0),
  source: z.string(),
  year: z.number().int().min(2000).max(2100),
});

export const AcademicsSchema = z.object({
  ranking: RankingSchema,
  accreditations: z.array(z.string()),
  totalStudents: z.number().int().min(0),
  internationalStudents: z.number().int().min(0),
  facultyCount: z.number().int().min(0),
  studentFacultyRatio: z.string(),
});

export const FacilitiesSchema = z.object({
  campusSize: z.string(),
  library: z.boolean(),
  sportsFacilities: z.boolean(),
  dormitories: z.boolean(),
  diningFacilities: z.boolean(),
  medicalCenter: z.boolean(),
  wifiCampus: z.boolean(),
  description: z.string(),
});

export const ProgramsSchema = z.object({
  undergraduate: z.array(z.string()),
  postgraduate: z.array(z.string()),
  phd: z.array(z.string()),
  totalPrograms: z.number().int().min(0),
});

export const FeesSchema = z.object({
  undergraduate: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().length(3),
  }),
  postgraduate: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().length(3),
  }),
  applicationFee: z.number().min(0),
  currency: z.string().length(3),
});

export const AdmissionSchema = z.object({
  requirements: z.array(z.string()),
  englishProficiency: z.array(z.string()),
  deadlines: z.object({
    fall: z.string(),
    spring: z.string(),
    summer: z.string(),
  }),
  applicationProcess: z.string(),
});

export const PartnershipsSchema = z.object({
  isPartnered: z.boolean(),
  agreementType: z.string(),
  commissionRate: z.number().min(0).max(100),
  specialBenefits: z.array(z.string()),
  contactPerson: z.string(),
});

export const MediaSchema = z.object({
  logo: z.string().url().optional().or(z.literal('')),
  bannerImage: z.string().url().optional().or(z.literal('')),
  gallery: z.array(z.string()),
  virtualTour: z.string().url().optional().or(z.literal('')),
  videos: z.array(z.string()),
});

export const SettingsSchema = z.object({
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  featuredPriority: z.number().int().min(0),
  tags: z.array(z.string()),
  targetCountries: z.array(z.string()),
  lastUpdated: z.string().datetime(),
  createdAt: z.string().datetime(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const UniversitySchema = z.object({
  id: z.string().optional(),
  basicInfo: BasicInfoSchema,
  academics: AcademicsSchema,
  facilities: FacilitiesSchema,
  programs: ProgramsSchema,
  fees: FeesSchema,
  admission: AdmissionSchema,
  partnerships: PartnershipsSchema,
  media: MediaSchema,
  settings: SettingsSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UniversityData = z.infer<typeof UniversitySchema>;
export type BasicInfo = z.infer<typeof BasicInfoSchema>;
export type Academics = z.infer<typeof AcademicsSchema>;
export type Facilities = z.infer<typeof FacilitiesSchema>;
export type Programs = z.infer<typeof ProgramsSchema>;
export type Fees = z.infer<typeof FeesSchema>;
export type Admission = z.infer<typeof AdmissionSchema>;
export type Partnerships = z.infer<typeof PartnershipsSchema>;
export type Media = z.infer<typeof MediaSchema>;
export type Settings = z.infer<typeof SettingsSchema>;
