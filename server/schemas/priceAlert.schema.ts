/**
 * Zod schemas for Price Alert model validation
 */

import { z } from 'zod';

const RouteSchema = z.object({
  from: z.string().length(3).toUpperCase(),
  to: z.string().length(3).toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const PassengersSchema = z.object({
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9).optional(),
  infants: z.number().int().min(0).max(9).optional(),
});

const PriceHistorySchema = z.object({
  price: z.number().min(0),
  timestamp: z.string().datetime(),
  triggered: z.boolean().optional(),
});

export const PriceAlertSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  email: z.string().email(),
  route: RouteSchema,
  targetPrice: z.number().positive(),
  currentPrice: z.number().min(0).optional(),
  currency: z.string().length(3).toUpperCase(),
  travelClass: z.enum(['economy', 'premium_economy', 'business', 'first']).optional(),
  passengers: PassengersSchema.optional(),
  frequency: z.enum(['immediate', 'daily', 'weekly']).default('immediate'),
  active: z.boolean().default(true),
  priceHistory: z.array(PriceHistorySchema).optional(),
  lastChecked: z.string().datetime().optional(),
  triggeredCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PriceAlertData = z.infer<typeof PriceAlertSchema>;
export type Route = z.infer<typeof RouteSchema>;
export type Passengers = z.infer<typeof PassengersSchema>;
export type PriceHistory = z.infer<typeof PriceHistorySchema>;
