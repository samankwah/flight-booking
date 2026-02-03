// server/instrument.js
// IMPORTANT: This file must be imported at the very top of server.js
// Initialize Sentry before any other imports for proper error tracking

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

// Load environment variables first
import './config/env.js';

const SENTRY_DSN = process.env.SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Only initialize Sentry if DSN is provided
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in prod, 100% in dev

    // Set profilesSampleRate to profile transactions
    profilesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will send default PII data to Sentry
    // For example, automatic IP address collection on events
    sendDefaultPii: true,

    // Integrations
    integrations: [
      // Profiling integration
      nodeProfilingIntegration(),
    ],

    // Capture uncaught exceptions and unhandled promise rejections
    beforeSend(event, hint) {
      // Filter out certain errors if needed
      const error = hint.originalException;

      // Don't send errors in development unless explicitly enabled
      if (NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
        console.log('[Sentry] Event suppressed in development:', error?.message);
        return null;
      }

      // Don't send errors for 404s
      if (error?.status === 404) {
        return null;
      }

      return event;
    },

    // Optional: Add custom tags
    initialScope: {
      tags: {
        service: 'flight-booking-backend',
        version: process.env.npm_package_version || '1.0.0',
      },
    },
  });

  console.log(`✅ Sentry initialized (environment: ${NODE_ENV})`);
} else {
  console.warn('⚠️  SENTRY_DSN not configured - error tracking disabled');
}

export default Sentry;
