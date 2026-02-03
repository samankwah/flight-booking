import express from 'express';
import { createPaymentLimiter } from '../middleware/rateLimiter.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { idempotencyMiddleware } from '../middleware/idempotency.js';
import { validate, paymentIntentSchema } from '../middleware/validation.js';
import {
  initializeTransaction,
  verifyTransaction,
  getTransaction,
  createRefund,
  handleWebhook,
} from '../controllers/paymentController.js';

const router = express.Router();

// Paystack webhook endpoint (no rate limiting for webhooks, verified by signature)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected payment endpoints - require authentication
router.post('/initialize', requireAuth, idempotencyMiddleware, validate(paymentIntentSchema), createPaymentLimiter, initializeTransaction);

router.get('/verify/:reference', requireAuth, createPaymentLimiter, verifyTransaction);

router.get('/transaction/:id', requireAuth, createPaymentLimiter, getTransaction);

router.post('/refund', requireAuth, createPaymentLimiter, createRefund);

// Get Paystack public key (for frontend)
router.get('/config', (req, res) => {
  const { PAYSTACK_PUBLIC_KEY } = require('../config/paystack.js');

  res.json({
    success: true,
    publicKey: PAYSTACK_PUBLIC_KEY,
  });
});

export default router;