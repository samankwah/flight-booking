/**
 * Firestore Data Backfill Script
 * Adds missing timestamps, normalizes field names, and migrates data structures
 */

import { db } from '../services/firestore/BaseService.js';
import logger from '../utils/logger.js';

interface BackfillResult {
  collection: string;
  totalDocuments: number;
  updated: number;
  skipped: number;
  errors: number;
}

/**
 * Add missing timestamps to documents
 */
async function addMissingTimestamps(collectionName: string): Promise<BackfillResult> {
  logger.info(`Processing collection: ${collectionName}`);

  const snapshot = await db.collection(collectionName).get();
  const result: BackfillResult = {
    collection: collectionName,
    totalDocuments: snapshot.size,
    updated: 0,
    skipped: 0,
    errors: 0
  };

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const updates: any = {};

    // Add createdAt if missing
    if (!data.createdAt) {
      updates.createdAt = new Date().toISOString();
    }

    // Add updatedAt if missing
    if (!data.updatedAt) {
      updates.updatedAt = data.createdAt || new Date().toISOString();
    }

    // If there are updates, add to batch
    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      batchCount++;
      result.updated++;

      // Firestore batch limit is 500 operations
      if (batchCount >= 500) {
        await batch.commit();
        logger.info(`  Committed batch of ${batchCount} updates`);
        batchCount = 0;
      }
    } else {
      result.skipped++;
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
    logger.info(`  Committed final batch of ${batchCount} updates`);
  }

  logger.info(`  Total: ${result.totalDocuments}, Updated: ${result.updated}, Skipped: ${result.skipped}`);

  return result;
}

/**
 * Normalize booking statuses
 */
async function normalizeBookingStatuses(): Promise<void> {
  logger.info('Normalizing booking statuses...');

  const collections = ['bookings', 'hotelBookings', 'holidayPackageBookings'];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    let count = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Normalize status values
      const statusMapping: Record<string, string> = {
        'booked': 'confirmed',
        'active': 'confirmed',
        'complete': 'completed',
        'canceled': 'cancelled'
      };

      const updates: any = {};

      if (data.status && statusMapping[data.status]) {
        updates.status = statusMapping[data.status];
      }

      if (data.paymentStatus) {
        const paymentMapping: Record<string, string> = {
          'completed': 'paid',
          'success': 'paid',
          'failure': 'failed'
        };

        if (paymentMapping[data.paymentStatus]) {
          updates.paymentStatus = paymentMapping[data.paymentStatus];
        }
      }

      if (Object.keys(updates).length > 0) {
        batch.update(doc.ref, updates);
        count++;

        if (count >= 500) {
          await batch.commit();
          count = 0;
        }
      }
    }

    if (count > 0) {
      await batch.commit();
    }

    logger.info(`  Normalized ${count} documents in ${collectionName}`);
  }
}

/**
 * Add missing IDs to documents
 */
async function addMissingDocumentIds(collectionName: string): Promise<void> {
  logger.info(`Adding missing IDs to ${collectionName}...`);

  const snapshot = await db.collection(collectionName).get();
  const batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    if (!data.id) {
      batch.update(doc.ref, { id: doc.id });
      count++;

      if (count >= 500) {
        await batch.commit();
        count = 0;
      }
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  logger.info(`  Added IDs to ${count} documents`);
}

/**
 * Migrate application workflow structure (for new Application model)
 */
async function migrateApplicationWorkflow(): Promise<void> {
  logger.info('Migrating application workflow structure...');

  const snapshot = await db.collection('applications').get();
  const batch = db.batch();
  let count = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    // Check if workflow structure needs migration
    if (data.status && !data.workflow) {
      const workflow = {
        status: data.status || 'draft',
        submittedAt: data.submittedAt || data.createdAt,
        reviewedAt: data.reviewedAt || null,
        completedAt: data.completedAt || null,
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo || null,
        notes: data.notes || ''
      };

      batch.update(doc.ref, { workflow });
      count++;

      if (count >= 500) {
        await batch.commit();
        count = 0;
      }
    }
  }

  if (count > 0) {
    await batch.commit();
  }

  logger.info(`  Migrated ${count} applications to new workflow structure`);
}

/**
 * Main backfill function
 */
async function backfillAllCollections(): Promise<void> {
  logger.info('Starting Firestore data backfill...');

  const collectionsToBackfill = [
    'bookings',
    'hotelBookings',
    'holidayPackageBookings',
    'visaApplications',
    'applications',
    'studyAbroadApplications',
    'universities',
    'studyAbroadPrograms',
    'priceAlerts',
    'notification-subscriptions',
    'notification-preferences',
    'specialOffers',
    'topDeals',
    'users'
  ];

  const results: BackfillResult[] = [];

  // Step 1: Add missing timestamps
  logger.info('\n=== Step 1: Adding missing timestamps ===');
  for (const collectionName of collectionsToBackfill) {
    try {
      const result = await addMissingTimestamps(collectionName);
      results.push(result);
    } catch (error) {
      logger.error(`Error processing ${collectionName}:`, error);
    }
  }

  // Step 2: Normalize booking statuses
  logger.info('\n=== Step 2: Normalizing booking statuses ===');
  try {
    await normalizeBookingStatuses();
  } catch (error) {
    logger.error('Error normalizing statuses:', error);
  }

  // Step 3: Add missing document IDs
  logger.info('\n=== Step 3: Adding missing document IDs ===');
  for (const collectionName of collectionsToBackfill) {
    try {
      await addMissingDocumentIds(collectionName);
    } catch (error) {
      logger.error(`Error adding IDs to ${collectionName}:`, error);
    }
  }

  // Step 4: Migrate application workflow
  logger.info('\n=== Step 4: Migrating application workflow ===');
  try {
    await migrateApplicationWorkflow();
  } catch (error) {
    logger.error('Error migrating workflow:', error);
  }

  // Summary
  logger.info('\n=== BACKFILL SUMMARY ===');
  const totalDocuments = results.reduce((sum, r) => sum + r.totalDocuments, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  logger.info(`Total documents processed: ${totalDocuments}`);
  logger.info(`Documents updated: ${totalUpdated}`);
  logger.info(`Documents skipped: ${totalSkipped}`);

  logger.info('\n✅ Backfill completed successfully!');
}

// Run backfill
backfillAllCollections()
  .then(() => {
    logger.info('\nBackfill process completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Backfill failed:', error);
    process.exit(1);
  });
