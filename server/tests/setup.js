// Test setup for server tests
import dotenv from "dotenv";

// Load test environment variables
dotenv.config({ path: ".env.test" });

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.FIREBASE_PROJECT_ID =
  process.env.FIREBASE_PROJECT_ID || "test-project";

// Mock Firebase Admin SDK
jest.mock("firebase-admin", () => ({
  initializeApp: jest.fn(() => ({})),
  auth: () => ({
    verifyIdToken: jest.fn(() => ({
      uid: "test-user-id",
      email: "test@example.com",
      name: "Test User",
    })),
  }),
  firestore: () => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(() => ({
          exists: true,
          data: () => ({}),
        })),
        update: jest.fn(),
        delete: jest.fn(),
      })),
      add: jest.fn(() => Promise.resolve({ id: "test-doc-id" })),
      where: jest.fn(() => ({
        get: jest.fn(() => ({
          docs: [],
        })),
      })),
    })),
  }),
}));

// Global test utilities
global.beforeEach(() => {
  jest.clearAllMocks();
});

global.afterEach(() => {
  jest.clearAllTimers();
});
