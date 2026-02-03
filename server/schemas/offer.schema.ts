/**
 * Zod schemas for Special Offer and Top Deal models validation
 */

import { z } from 'zod';

/**
 * Special Offer Schema
 */
export const SpecialOfferSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  type: z.enum(['flight', 'hotel', 'package', 'visa', 'study_abroad']),
  discount: z.object({
    type: z.enum(['percentage', 'fixed']),
    value: z.number().min(0),
    currency: z.string().length(3).optional(),
  }),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  destination: z.string().max(200).optional(),
  restrictions: z.array(z.string()).optional(),
  promoCode: z.string().max(50).optional(),
  maxRedemptions: z.number().int().min(0).optional(),
  currentRedemptions: z.number().int().min(0).default(0),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
  createdBy: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Top Deal Schema
 */
export const TopDealSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000),
  category: z.enum(['flight', 'hotel', 'package', 'destination']),
  price: z.object({
    original: z.number().min(0),
    discounted: z.number().min(0),
    currency: z.string().length(3),
  }),
  destination: z.object({
    city: z.string(),
    country: z.string(),
    airportCode: z.string().length(3).optional(),
  }),
  validFrom: z.string().datetime(),
  validUntil: z.string().datetime(),
  imageUrl: z.string().url(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  priority: z.number().int().min(0).default(0),
  clickCount: z.number().int().min(0).default(0),
  conversionCount: z.number().int().min(0).default(0),
  metadata: z.record(z.any()).optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SpecialOfferData = z.infer<typeof SpecialOfferSchema>;
export type TopDealData = z.infer<typeof TopDealSchema>;
