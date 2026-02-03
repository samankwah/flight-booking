/**
 * Shared TypeScript types used across the application
 */

import { Timestamp } from 'firebase-admin/firestore';

/**
 * Base interface for all Firestore documents
 */
export interface IFirestoreDocument {
  id?: string;
  createdAt: string | Timestamp;
  updatedAt: string | Timestamp;
}

/**
 * Status types for bookings and applications
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn';
export type VisaStatus = 'submitted' | 'processing' | 'under_review' | 'approved' | 'rejected' | 'cancelled';

/**
 * Common data types
 */
export type Currency = 'USD' | 'EUR' | 'GBP' | 'GHS' | 'NGN' | 'KES' | 'ZAR' | string;
export type CountryCode = string; // ISO 3166-1 alpha-2
export type AirportCode = string; // IATA 3-letter code

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
  cursor?: string;
}

/**
 * Query filter options
 */
export interface QueryFilter {
  field: string;
  operator: FirebaseFirestore.WhereFilterOp;
  value: any;
}

/**
 * Query options for services
 */
export interface QueryOptions {
  where?: QueryFilter[];
  orderBy?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  limit?: number;
  offset?: number;
  startAfter?: any;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  lastDoc?: any;
  nextCursor?: string;
}

/**
 * API Response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}

/**
 * Timestamp helper type
 */
export type FirestoreTimestamp = string | Timestamp | Date;
