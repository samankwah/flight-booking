/**
 * Zod schemas for User model validation
 */

import { z } from 'zod';

/**
 * User Schema
 */
export const UserSchema = z.object({
  id: z.string().optional(),
  uid: z.string().min(1), // Firebase Auth UID
  email: z.string().email(),
  displayName: z.string().max(200).optional(),
  photoURL: z.string().url().optional(),
  phoneNumber: z.string().max(20).optional(),
  isAdmin: z.boolean().default(false),
  isDisabled: z.boolean().default(false),
  profile: z.object({
    firstName: z.string().max(100).optional(),
    lastName: z.string().max(100).optional(),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    nationality: z.string().length(2).optional(),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    postalCode: z.string().max(20).optional(),
  }).optional(),
  preferences: z.object({
    currency: z.string().length(3).default('USD'),
    language: z.string().length(2).default('en'),
    timezone: z.string().optional(),
    newsletter: z.boolean().default(false),
  }).optional(),
  metadata: z.object({
    lastLogin: z.string().datetime().optional(),
    loginCount: z.number().int().min(0).default(0),
    emailVerified: z.boolean().default(false),
    phoneVerified: z.boolean().default(false),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserData = z.infer<typeof UserSchema>;
