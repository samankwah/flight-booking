// server/config/firebase.js
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let app = null;
let db = null;
let auth = null;
let isFirebaseAvailable = false;

try {
  // Check if we're in a proper Firebase environment
  // For development without credentials, Firebase features will be disabled
  const firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID || "flight-book-82ea4",
  };

  // Only initialize if we have proper credentials or are in GCP environment
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : undefined;

    const config = serviceAccount
      ? { credential: admin.credential.cert(serviceAccount), ...firebaseConfig }
      : firebaseConfig;

    app = admin.initializeApp(config);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseAvailable = true;
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.warn('⚠️  Firebase credentials not configured - Firebase features disabled');
    console.warn('   To enable Firebase: Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT env variable');

    // Create mock db and auth objects to prevent crashes
    db = {
      collection: () => ({
        where: () => ({ get: async () => ({ docs: [] }) }),
        get: async () => ({ docs: [] }),
        add: async () => ({ id: 'mock-id' }),
        doc: () => ({
          get: async () => ({ exists: false }),
          set: async () => {},
          update: async () => {},
          delete: async () => {},
        }),
      }),
    };

    auth = {
      verifyIdToken: async () => { throw new Error('Firebase Auth not configured'); },
      createUser: async () => { throw new Error('Firebase Auth not configured'); },
    };
  }
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    app = admin.app();
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseAvailable = true;
    console.log('✅ Firebase Admin already initialized');
  } else {
    console.error('❌ Error initializing Firebase Admin:', error.message);
    console.warn('⚠️  Continuing without Firebase - some features will be disabled');

    // Create mock objects
    db = {
      collection: () => ({
        where: () => ({ get: async () => ({ docs: [] }) }),
        get: async () => ({ docs: [] }),
        add: async () => ({ id: 'mock-id' }),
        doc: () => ({
          get: async () => ({ exists: false }),
          set: async () => {},
          update: async () => {},
          delete: async () => {},
        }),
      }),
    };

    auth = {
      verifyIdToken: async () => { throw new Error('Firebase Auth not configured'); },
      createUser: async () => { throw new Error('Firebase Auth not configured'); },
    };
  }
}

// Export Firestore and Auth instances
export { db, auth, isFirebaseAvailable };
export default app;
