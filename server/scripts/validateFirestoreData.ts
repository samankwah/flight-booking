/**
 * Firestore Data Validation Script
 * Validates all documents against Zod schemas and reports invalid documents
 */

import { db } from '../services/firestore/BaseService.js';
import {
  BookingSchema,
  HotelBookingSchema,
  HolidayPackageBookingSchema,
  VisaApplicationSchema,
  ApplicationSchema,
  UniversitySchema,
  StudyAbroadProgramSchema,
  PriceAlertSchema,
  NotificationSubscriptionSchema,
  NotificationPreferenceSchema,
  SpecialOfferSchema,
  TopDealSchema,
  UserSchema,
  StudyAbroadApplicationSchema
} from '../schemas/index.js';
import logger from '../utils/logger.js';

interface ValidationResult {
  collection: string;
  totalDocuments: number;
  validDocuments: number;
  invalidDocuments: number;
  errors: Array<{
    documentId: string;
    errors: any[];
  }>;
}

const COLLECTIONS_TO_VALIDATE = [
  { name: 'bookings', schema: BookingSchema },
  { name: 'hotelBookings', schema: HotelBookingSchema },
  { name: 'holidayPackageBookings', schema: HolidayPackageBookingSchema },
  { name: 'visaApplications', schema: VisaApplicationSchema },
  { name: 'applications', schema: ApplicationSchema },
  { name: 'universities', schema: UniversitySchema },
  { name: 'studyAbroadPrograms', schema: StudyAbroadProgramSchema },
  { name: 'priceAlerts', schema: PriceAlertSchema },
  { name: 'notification-subscriptions', schema: NotificationSubscriptionSchema },
  { name: 'notification-preferences', schema: NotificationPreferenceSchema },
  { name: 'specialOffers', schema: SpecialOfferSchema },
  { name: 'topDeals', schema: TopDealSchema },
  { name: 'users', schema: UserSchema },
  { name: 'studyAbroadApplications', schema: StudyAbroadApplicationSchema }
];

/**
 * Validate all documents in a collection
 */
async function validateCollection(
  collectionName: string,
  schema: any
): Promise<ValidationResult> {
  logger.info(`Validating collection: ${collectionName}`);

  const snapshot = await db.collection(collectionName).get();
  const result: ValidationResult = {
    collection: collectionName,
    totalDocuments: snapshot.size,
    validDocuments: 0,
    invalidDocuments: 0,
    errors: []
  };

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const validationResult = await schema.safeParseAsync(data);

    if (validationResult.success) {
      result.validDocuments++;
    } else {
      result.invalidDocuments++;
      result.errors.push({
        documentId: doc.id,
        errors: validationResult.error.errors
      });
    }
  }

  return result;
}

/**
 * Main validation function
 */
async function validateAllCollections(): Promise<void> {
  logger.info('Starting Firestore data validation...');
  logger.info(`Validating ${COLLECTIONS_TO_VALIDATE.length} collections`);

  const results: ValidationResult[] = [];

  for (const { name, schema } of COLLECTIONS_TO_VALIDATE) {
    try {
      const result = await validateCollection(name, schema);
      results.push(result);

      logger.info(`Collection: ${name}`);
      logger.info(`  Total: ${result.totalDocuments}`);
      logger.info(`  Valid: ${result.validDocuments}`);
      logger.info(`  Invalid: ${result.invalidDocuments}`);

      if (result.invalidDocuments > 0) {
        logger.warn(`  Found ${result.invalidDocuments} invalid documents`);

        // Log first 5 errors
        for (const error of result.errors.slice(0, 5)) {
          logger.error(`  Document ${error.documentId}:`);
          for (const err of error.errors) {
            logger.error(`    - ${err.path.join('.')}: ${err.message}`);
          }
        }

        if (result.errors.length > 5) {
          logger.warn(`  ... and ${result.errors.length - 5} more errors`);
        }
      }
    } catch (error) {
      logger.error(`Error validating collection ${name}:`, error);
    }
  }

  // Summary
  logger.info('\n=== VALIDATION SUMMARY ===');
  const totalDocuments = results.reduce((sum, r) => sum + r.totalDocuments, 0);
  const totalValid = results.reduce((sum, r) => sum + r.validDocuments, 0);
  const totalInvalid = results.reduce((sum, r) => sum + r.invalidDocuments, 0);

  logger.info(`Total documents validated: ${totalDocuments}`);
  logger.info(`Valid documents: ${totalValid} (${((totalValid / totalDocuments) * 100).toFixed(2)}%)`);
  logger.info(`Invalid documents: ${totalInvalid} (${((totalInvalid / totalDocuments) * 100).toFixed(2)}%)`);

  // Collections with issues
  const collectionsWithIssues = results.filter(r => r.invalidDocuments > 0);
  if (collectionsWithIssues.length > 0) {
    logger.warn('\nCollections with validation errors:');
    for (const result of collectionsWithIssues) {
      logger.warn(`  - ${result.collection}: ${result.invalidDocuments} invalid documents`);
    }
  } else {
    logger.info('\n✅ All documents are valid!');
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalCollections: COLLECTIONS_TO_VALIDATE.length,
      totalDocuments,
      validDocuments: totalValid,
      invalidDocuments: totalInvalid,
      validationRate: `${((totalValid / totalDocuments) * 100).toFixed(2)}%`
    },
    collections: results
  };

  // Write report to file
  const fs = await import('fs/promises');
  const reportPath = `validation-report-${Date.now()}.json`;
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  logger.info(`\nDetailed report saved to: ${reportPath}`);
}

// Run validation
validateAllCollections()
  .then(() => {
    logger.info('\nValidation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('Validation failed:', error);
    process.exit(1);
  });
