/**
 * Firestore Backup Script
 * Exports all collections to JSON files for backup purposes
 */

import { db } from '../services/firestore/BaseService.js';
import logger from '../utils/logger.js';
import * as fs from 'fs/promises';
import * as path from 'path';

const COLLECTIONS_TO_BACKUP = [
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

interface BackupMetadata {
  timestamp: string;
  collections: Array<{
    name: string;
    documentCount: number;
  }>;
  totalDocuments: number;
}

/**
 * Backup a single collection
 */
async function backupCollection(
  collectionName: string,
  backupDir: string
): Promise<number> {
  logger.info(`Backing up collection: ${collectionName}`);

  const snapshot = await db.collection(collectionName).get();
  const documents: any[] = [];

  for (const doc of snapshot.docs) {
    documents.push({
      id: doc.id,
      ...doc.data()
    });
  }

  // Write to JSON file
  const filename = `${collectionName}.json`;
  const filepath = path.join(backupDir, filename);

  await fs.writeFile(
    filepath,
    JSON.stringify(documents, null, 2),
    'utf-8'
  );

  logger.info(`  Backed up ${documents.length} documents to ${filename}`);

  return documents.length;
}

/**
 * Main backup function
 */
async function backupFirestore(): Promise<void> {
  logger.info('Starting Firestore backup...');

  // Create backup directory with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups', `backup-${timestamp}`);

  await fs.mkdir(backupDir, { recursive: true });
  logger.info(`Backup directory: ${backupDir}`);

  const metadata: BackupMetadata = {
    timestamp: new Date().toISOString(),
    collections: [],
    totalDocuments: 0
  };

  // Backup each collection
  for (const collectionName of COLLECTIONS_TO_BACKUP) {
    try {
      const count = await backupCollection(collectionName, backupDir);

      metadata.collections.push({
        name: collectionName,
        documentCount: count
      });

      metadata.totalDocuments += count;
    } catch (error) {
      logger.error(`Error backing up ${collectionName}:`, error);
    }
  }

  // Write metadata file
  const metadataPath = path.join(backupDir, 'metadata.json');
  await fs.writeFile(
    metadataPath,
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );

  logger.info('\n=== BACKUP SUMMARY ===');
  logger.info(`Backup location: ${backupDir}`);
  logger.info(`Collections backed up: ${metadata.collections.length}`);
  logger.info(`Total documents: ${metadata.totalDocuments}`);
  logger.info('\n✅ Backup completed successfully!');
}

// Run backup
backupFirestore()
  .then(() => {
    logger.info('\nBackup process completed');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Backup failed:', error);
    process.exit(1);
  });
