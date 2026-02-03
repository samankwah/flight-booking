/**
 * Zod schemas for Notification models validation
 */

import { z } from 'zod';

/**
 * Notification Subscription Schema
 */
export const NotificationSubscriptionSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  isActive: z.boolean().default(true),
  deviceInfo: z.object({
    browser: z.string().optional(),
    os: z.string().optional(),
    device: z.string().optional(),
  }).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Notification Preference Schema
 */
export const NotificationPreferenceSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  email: z.string().email(),
  preferences: z.object({
    priceAlerts: z.boolean().default(true),
    bookingConfirmations: z.boolean().default(true),
    flightReminders: z.boolean().default(true),
    promotions: z.boolean().default(false),
    applicationUpdates: z.boolean().default(true),
    visaUpdates: z.boolean().default(true),
  }),
  channels: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    sms: z.boolean().default(false),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type NotificationSubscriptionData = z.infer<typeof NotificationSubscriptionSchema>;
export type NotificationPreferenceData = z.infer<typeof NotificationPreferenceSchema>;
