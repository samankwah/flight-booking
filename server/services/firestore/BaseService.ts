/**
 * BaseService - Abstract base class for all Firestore services
 * Provides CRUD operations, cursor-based pagination, and query building
 */

import { db as firebaseDb } from '../../config/firebase.js';
import { BaseModel } from '../../models/BaseModel.js';
import { IFirestoreDocument } from '../../types/shared.js';
import {
  Firestore,
  CollectionReference,
  Query,
  QueryDocumentSnapshot,
  Transaction,
  WriteBatch,
  WhereFilterOp,
  OrderByDirection,
  FieldPath
} from 'firebase-admin/firestore';

// Type-cast db to Firestore type and export for other services
export const db = firebaseDb as Firestore;

// Query filter configuration
export interface QueryFilter {
  field: string | FieldPath;
  operator: WhereFilterOp;
  value: any;
}

// Order by configuration
export interface OrderBy {
  field: string | FieldPath;
  direction: OrderByDirection;
}

// Query options for flexible querying
export interface QueryOptions {
  where?: QueryFilter[];
  orderBy?: OrderBy[];
  limit?: number;
  startAfter?: QueryDocumentSnapshot;
  startAt?: QueryDocumentSnapshot;
}

// Pagination result with cursor information
export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: QueryDocumentSnapshot;
  total?: number;
}

// Batch operation result
export interface BatchResult {
  success: boolean;
  count: number;
  errors?: Error[];
}

/**
 * Abstract BaseService class providing common database operations
 * @template T - The model interface extending IFirestoreDocument
 * @template M - The model class extending BaseModel<T>
 */
export abstract class BaseService<T extends IFirestoreDocument, M extends BaseModel<T>> {
  protected collection: CollectionReference;
  protected abstract modelClass: new (data: T) => M;

  constructor(collectionName: string) {
    this.collection = db.collection(collectionName);
  }

  /**
   * Build a Firestore query from options
   */
  protected buildQuery(options: QueryOptions): Query {
    let query: Query = this.collection;

    // Apply where filters
    if (options.where && options.where.length > 0) {
      for (const filter of options.where) {
        query = query.where(filter.field, filter.operator, filter.value);
      }
    }

    // Apply ordering
    if (options.orderBy && options.orderBy.length > 0) {
      for (const order of options.orderBy) {
        query = query.orderBy(order.field, order.direction);
      }
    }

    // Apply cursor pagination
    if (options.startAfter) {
      query = query.startAfter(options.startAfter);
    } else if (options.startAt) {
      query = query.startAt(options.startAt);
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query;
  }

  /**
   * Convert Firestore document to model instance
   */
  protected toModel(doc: QueryDocumentSnapshot): M {
    return BaseModel.fromFirestore<M>(
      this.modelClass,
      doc.id,
      doc.data()
    );
  }

  /**
   * Find a document by ID
   */
  async findById(id: string): Promise<M | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return this.toModel(doc as QueryDocumentSnapshot);
  }

  /**
   * Find multiple documents by IDs
   */
  async findByIds(ids: string[]): Promise<M[]> {
    if (ids.length === 0) return [];

    // Firestore has a limit of 10 documents per getAll call
    const chunks = this.chunkArray(ids, 10);
    const results: M[] = [];

    for (const chunk of chunks) {
      const docRefs = chunk.map(id => this.collection.doc(id));
      const docs = await db.getAll(...docRefs);

      for (const doc of docs) {
        if (doc.exists) {
          results.push(this.toModel(doc as QueryDocumentSnapshot));
        }
      }
    }

    return results;
  }

  /**
   * Find all documents matching query options
   */
  async findAll(options: QueryOptions = {}): Promise<M[]> {
    const query = this.buildQuery(options);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => this.toModel(doc));
  }

  /**
   * Find documents with cursor-based pagination
   */
  async findPaginated(options: QueryOptions): Promise<PaginatedResult<M>> {
    const limit = options.limit || 20;

    // Request one extra document to check if there are more results
    const query = this.buildQuery({ ...options, limit: limit + 1 });
    const snapshot = await query.get();

    const hasMore = snapshot.docs.length > limit;
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;
    const data = docs.map(doc => this.toModel(doc));

    return {
      data,
      hasMore,
      nextCursor: hasMore ? docs[docs.length - 1] : undefined
    };
  }

  /**
   * Find one document matching query options
   */
  async findOne(options: QueryOptions): Promise<M | null> {
    const query = this.buildQuery({ ...options, limit: 1 });
    const snapshot = await query.get();

    if (snapshot.empty) {
      return null;
    }

    return this.toModel(snapshot.docs[0]);
  }

  /**
   * Count documents matching query options
   */
  async count(options: QueryOptions = {}): Promise<number> {
    const query = this.buildQuery(options);
    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  /**
   * Check if any documents match query options
   */
  async exists(options: QueryOptions): Promise<boolean> {
    const count = await this.count(options);
    return count > 0;
  }

  /**
   * Create a new document
   */
  async create(model: M): Promise<M> {
    // Validate before saving
    await model.validate();

    const data = model.toFirestore();
    const docRef = await this.collection.add(data);

    // Fetch the created document to get server timestamps
    const doc = await docRef.get();
    return this.toModel(doc as QueryDocumentSnapshot);
  }

  /**
   * Create a new document with a specific ID
   */
  async createWithId(id: string, model: M): Promise<M> {
    await model.validate();

    const data = model.toFirestore();
    await this.collection.doc(id).set(data);

    const doc = await this.collection.doc(id).get();
    return this.toModel(doc as QueryDocumentSnapshot);
  }

  /**
   * Update an existing document
   */
  async update(id: string, updates: Partial<T>): Promise<M> {
    const docRef = this.collection.doc(id);

    // Add updatedAt timestamp
    const data = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await docRef.update(data);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error(`Document ${id} not found after update`);
    }

    return this.toModel(doc as QueryDocumentSnapshot);
  }

  /**
   * Update or create a document (upsert)
   */
  async upsert(id: string, model: M): Promise<M> {
    await model.validate();

    const data = model.toFirestore();
    await this.collection.doc(id).set(data, { merge: true });

    const doc = await this.collection.doc(id).get();
    return this.toModel(doc as QueryDocumentSnapshot);
  }

  /**
   * Delete a document by ID
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }

  /**
   * Delete multiple documents by IDs
   */
  async deleteMany(ids: string[]): Promise<BatchResult> {
    if (ids.length === 0) {
      return { success: true, count: 0 };
    }

    const batches = this.createBatches(ids.map(id => ({ type: 'delete', id })));

    try {
      await Promise.all(batches.map(batch => batch.commit()));
      return { success: true, count: ids.length };
    } catch (error) {
      return {
        success: false,
        count: 0,
        errors: [error as Error]
      };
    }
  }

  /**
   * Batch create multiple documents
   */
  async createMany(models: M[]): Promise<BatchResult> {
    if (models.length === 0) {
      return { success: true, count: 0 };
    }

    // Validate all models first
    await Promise.all(models.map(model => model.validate()));

    const operations = models.map(model => ({
      type: 'create' as const,
      data: model.toFirestore()
    }));

    const batches = this.createBatches(operations);

    try {
      await Promise.all(batches.map(batch => batch.commit()));
      return { success: true, count: models.length };
    } catch (error) {
      return {
        success: false,
        count: 0,
        errors: [error as Error]
      };
    }
  }

  /**
   * Execute operations in a transaction
   */
  async transaction<R>(
    callback: (transaction: Transaction) => Promise<R>
  ): Promise<R> {
    return db.runTransaction(callback);
  }

  /**
   * Create batches for batch operations (Firestore limit: 500 operations per batch)
   */
  protected createBatches(
    operations: Array<
      | { type: 'create'; data: any }
      | { type: 'update'; id: string; data: any }
      | { type: 'delete'; id: string }
    >
  ): WriteBatch[] {
    const batches: WriteBatch[] = [];
    let currentBatch = db.batch();
    let operationCount = 0;

    for (const op of operations) {
      if (operationCount >= 500) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
      }

      if (op.type === 'create') {
        const docRef = this.collection.doc();
        currentBatch.set(docRef, op.data);
      } else if (op.type === 'update') {
        const docRef = this.collection.doc(op.id);
        currentBatch.update(docRef, op.data);
      } else if (op.type === 'delete') {
        const docRef = this.collection.doc(op.id);
        currentBatch.delete(docRef);
      }

      operationCount++;
    }

    if (operationCount > 0) {
      batches.push(currentBatch);
    }

    return batches;
  }

  /**
   * Chunk an array into smaller arrays
   */
  protected chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Subscribe to real-time updates for a single document
   */
  onSnapshot(
    id: string,
    callback: (model: M | null) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.collection.doc(id).onSnapshot(
      (doc) => {
        if (doc.exists) {
          callback(this.toModel(doc as QueryDocumentSnapshot));
        } else {
          callback(null);
        }
      },
      errorCallback
    );
  }

  /**
   * Subscribe to real-time updates for a query
   */
  onSnapshotQuery(
    options: QueryOptions,
    callback: (models: M[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    const query = this.buildQuery(options);

    return query.onSnapshot(
      (snapshot) => {
        const models = snapshot.docs.map(doc => this.toModel(doc));
        callback(models);
      },
      errorCallback
    );
  }
}
