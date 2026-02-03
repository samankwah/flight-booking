// Test setup for server tests
import { jest } from '@jest/globals';

// Set test environment
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-for-testing-only";
process.env.PAYSTACK_SECRET_KEY = "sk_test_mock_secret_key_for_testing";
process.env.PAYSTACK_PUBLIC_KEY = "pk_test_mock_public_key_for_testing";
process.env.FIREBASE_PROJECT_ID = "test-project-id";
process.env.VALID_API_KEYS = "test-key-1,test-key-2,test-key-3";

// Suppress console output during tests (optional)
if (process.env.SUPPRESS_LOGS === 'true') {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}
