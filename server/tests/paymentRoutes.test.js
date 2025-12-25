import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import paymentRoutes from '../routes/paymentRoutes.js';

// Mock Paystack
jest.mock('../config/paystack.js', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
  PAYSTACK_PUBLIC_KEY: 'pk_test_mock_key',
}));

// Mock the payment controller
jest.mock('../controllers/paymentController.js', () => ({
  initializeTransaction: [
    (req, res, next) => {
      // Mock validation middleware
      next();
    },
    async (req, res) => {
      const mockPaystack = (await import('../config/paystack.js')).default;

      mockPaystack.post.mockResolvedValue({
        data: {
          status: true,
          data: {
            authorization_url: 'https://paystack.com/pay/test123',
            access_code: 'test_access_code',
            reference: 'test_reference_123',
          },
        },
      });

      // Call the actual controller logic
      const { initializeTransaction } = await import('../controllers/paymentController.js');
      return initializeTransaction[1](req, res);
    },
  ],
  verifyTransaction: [
    (req, res, next) => next(),
    async (req, res) => {
      const mockPaystack = (await import('../config/paystack.js')).default;

      mockPaystack.get.mockResolvedValue({
        data: {
          status: true,
          data: {
            status: 'success',
            amount: 50000,
            currency: 'NGN',
            reference: 'test_reference_123',
            customer: { email: 'test@example.com' },
            paid_at: new Date().toISOString(),
          },
        },
      });

      const { verifyTransaction } = await import('../controllers/paymentController.js');
      return verifyTransaction[1](req, res);
    },
  ],
  getTransaction: async (req, res) => {
    const mockPaystack = (await import('../config/paystack.js')).default;

    mockPaystack.get.mockResolvedValue({
      data: {
        status: true,
        data: {
          id: 'test_transaction_123',
          status: 'success',
          amount: 50000,
          currency: 'NGN',
          reference: 'test_reference_123',
        },
      },
    });

    const { getTransaction } = await import('../controllers/paymentController.js');
    return getTransaction(req, res);
  },
  createRefund: [
    (req, res, next) => next(),
    async (req, res) => {
      const { createRefund } = await import('../controllers/paymentController.js');
      return createRefund[1](req, res);
    },
  ],
}));

describe('Payment Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/payments', paymentRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/payments/initialize', () => {
    it('should initialize transaction successfully', async () => {
      const paymentData = {
        amount: 500.00,
        currency: 'NGN',
        email: 'test@example.com',
        bookingId: 'booking_123',
      };

      const response = await request(app)
        .post('/api/payments/initialize')
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.authorization_url).toBeDefined();
      expect(response.body.access_code).toBeDefined();
      expect(response.body.reference).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/payments/initialize')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/payments/verify/:reference', () => {
    it('should verify transaction successfully', async () => {
      const response = await request(app)
        .get('/api/payments/verify/test_reference_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('success');
      expect(response.body.amount).toBeDefined();
      expect(response.body.currency).toBe('NGN');
    });
  });

  describe('GET /api/payments/transaction/:id', () => {
    it('should retrieve transaction', async () => {
      const response = await request(app)
        .get('/api/payments/transaction/test_transaction_123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe('test_transaction_123');
    });
  });

  describe('POST /api/payments/refund', () => {
    it('should create refund request successfully', async () => {
      const refundData = {
        reference: 'test_reference_123',
        amount: 250.00,
      };

      const response = await request(app)
        .post('/api/payments/refund')
        .send(refundData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.reference).toBe('test_reference_123');
    });
  });

  describe('GET /api/payments/config', () => {
    it('should return Paystack public key', async () => {
      const response = await request(app)
        .get('/api/payments/config')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.publicKey).toBeDefined();
    });
  });
});
