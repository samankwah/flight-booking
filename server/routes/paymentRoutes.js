import express from 'express';
import { createPaymentLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken } from '../middleware/auth.js';
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
router.post('/initialize', authenticateToken, createPaymentLimiter, initializeTransaction);

router.get('/verify/:reference', authenticateToken, createPaymentLimiter, verifyTransaction);

router.get('/transaction/:id', authenticateToken, createPaymentLimiter, getTransaction);

router.post('/refund', authenticateToken, createPaymentLimiter, createRefund);

// Get Paystack public key (for frontend)
router.get('/config', (req, res) => {
  const { PAYSTACK_PUBLIC_KEY } = require('../config/paystack.js');

  res.json({
    success: true,
    publicKey: PAYSTACK_PUBLIC_KEY,
  });
});

export default router;