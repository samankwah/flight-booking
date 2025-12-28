import paystackService from '../services/paystackService.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

export const initializeTransaction = [
  // Validation
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').optional().isString().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('bookingId').optional().isString().withMessage('Booking ID must be a string'),
  body('callback_url').optional().isURL().withMessage('Callback URL must be valid'),

  async (req, res, next) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { amount, currency = 'NGN', email, bookingId, metadata, callback_url } = req.body;

      // Generate unique reference
      const reference = `flight-booking-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Convert amount to kobo for NGN
      const amountInKobo = paystackService.convertToKobo(amount);

      // Initialize transaction
      const transaction = await paystackService.initializeTransaction({
        amount: amountInKobo,
        email,
        reference,
        metadata: {
          bookingId: bookingId || '',
          currency: currency.toUpperCase(),
          originalAmount: amount,
          ...(metadata || {}),
        },
        callback_url: callback_url || `${req.protocol}://${req.get('host')}/api/payments/callback`,
      });

      res.json({
        success: true,
        data: transaction,
        reference: transaction.reference,
        authorization_url: transaction.authorization_url,
        access_code: transaction.access_code,
      });
    } catch (error) {
      console.error('Transaction initialization error:', error);
      next(error);
    }
  },
];

export const verifyTransaction = [
  // Validation
  body('reference').optional().isString().withMessage('Reference must be a string'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { reference } = req.params;

      // Verify transaction
      const verification = await paystackService.verifyTransaction(reference);

      res.json({
        success: true,
        data: verification,
        status: verification.status,
        amount: paystackService.convertFromKobo(verification.amount),
        currency: verification.currency,
        reference: verification.reference,
        customer: verification.customer,
        paid_at: verification.paid_at,
      });
    } catch (error) {
      console.error('Transaction verification error:', error);
      next(error);
    }
  },
];

export const getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await paystackService.getTransaction(id);

    res.json({
      success: true,
      data: {
        ...transaction.data,
        amount: paystackService.convertFromKobo(transaction.data.amount),
      },
    });
  } catch (error) {
    console.error('Transaction retrieval error:', error);
    next(error);
  }
};

export const createRefund = [
  // Validation
  body('reference').isString().withMessage('Transaction reference is required'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),

  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array(),
        });
      }

      const { reference, amount } = req.body;

      // Paystack refunds are handled differently - they require the transaction reference
      // and the refund amount in kobo
      const refundAmount = amount ? paystackService.convertToKobo(amount) : undefined;

      // Note: Paystack refund API might require additional setup
      // For now, we'll return a placeholder response
      res.json({
        success: true,
        message: 'Refund request received. Manual processing required.',
        reference,
        amount: refundAmount,
        status: 'pending',
        note: 'Paystack refunds may require manual processing. Please contact support.',
      });
    } catch (error) {
      console.error('Refund creation error:', error);
      next(error);
    }
  },
];

// Paystack webhook handler
export const handleWebhook = async (req, res, next) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = req.headers['x-paystack-signature'];

    // Verify webhook signature
    const expectedSignature = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== expectedSignature) {
      console.error('Invalid webhook signature received');
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        console.log('Payment successful:', event.data);
        // Update booking status, send confirmation email, etc.
        break;

      case 'charge.failed':
        console.log('Payment failed:', event.data);
        // Handle failed payment
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    next(error);
  }
};