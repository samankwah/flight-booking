/**
 * BaseModel - Abstract base class for all Firestore models
 * Provides common functionality for serialization, deserialization, and validation
 */

import { Timestamp } from 'firebase-admin/firestore';
import { IFirestoreDocument, FirestoreTimestamp } from '../types/shared.js';

export abstract class BaseModel<T extends IFirestoreDocument> implements IFirestoreDocument {
  id?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: T) {
    this.id = data.id;
    this.createdAt = this.normalizeTimestamp(data.createdAt);
    this.updatedAt = this.normalizeTimestamp(data.updatedAt);
  }

  /**
   * Normalize various timestamp formats to ISO string
   */
  protected normalizeTimestamp(ts: FirestoreTimestamp): string {
    if (!ts) {
      return new Date().toISOString();
    }

    if (typeof ts === 'string') {
      return ts;
    }

    if (ts instanceof Date) {
      return ts.toISOString();
    }

    // Firestore Timestamp
    if (ts && typeof ts === 'object' && 'toDate' in ts) {
      return (ts as Timestamp).toDate().toISOString();
    }

    return new Date().toISOString();
  }

  /**
   * Convert model instance to Firestore document format
   * @abstract Must be implemented by subclasses
   */
  abstract toFirestore(): Record<string, any>;

  /**
   * Validate the model data
   * @abstract Must be implemented by subclasses using Zod schemas
   */
  abstract validate(): Promise<void> | void;

  /**
   * Create model instance from Firestore document
   * @static Factory method to create instances from Firestore data
   */
  static fromFirestore<T extends BaseModel<any>>(
    this: new (data: any) => T,
    id: string,
    data: Record<string, any>
  ): T {
    return new this({ id, ...data });
  }

  /**
   * Create a new instance with updated fields
   * @param updates Partial update data
   * @returns New instance with updates applied
   */
  withUpdates(updates: Partial<T>): this {
    const constructor = this.constructor as new (data: T) => this;
    return new constructor({
      ...this.toFirestore(),
      ...updates,
      updatedAt: new Date().toISOString(),
    } as T);
  }

  /**
   * Check if document has an ID (exists in Firestore)
   */
  exists(): boolean {
    return !!this.id;
  }

  /**
   * Get document age in milliseconds
   */
  getAge(): number {
    return Date.now() - new Date(this.createdAt).getTime();
  }

  /**
   * Check if document was updated after creation
   */
  wasUpdated(): boolean {
    return this.createdAt !== this.updatedAt;
  }

  /**
   * Get JSON representation
   */
  toJSON(): Record<string, any> {
    return this.toFirestore();
  }
}
