import paystackService from '../services/paystackService.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import { db } from '../config/firebase.js';
import { sendBookingEmail } from '../services/gmailEmailService.js';

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
        currency: currency.toUpperCase(), // Pass currency to Paystack API
        metadata: {
          bookingId: bookingId || '',
          currency: currency.toUpperCase(),
          originalAmount: amount,
          ...(metadata || {}),
        },
        callback_url: callback_url || `${req.protocol}://${req.get('host')}/api/payments/callback`,
      });

      logger.logPayment('Transaction initialized', {
        reference,
        amount,
        currency,
        email,
        bookingId,
      });

      res.json({
        success: true,
        data: transaction,
        reference: transaction.reference,
        authorization_url: transaction.authorization_url,
        access_code: transaction.access_code,
      });
    } catch (error) {
      logger.error('Transaction initialization error', { error: error.message, stack: error.stack });
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

      logger.logPayment('Transaction verified', {
        reference,
        status: verification.status,
        amount: paystackService.convertFromKobo(verification.amount),
        currency: verification.currency,
      });

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
      logger.error('Transaction verification error', { error: error.message, stack: error.stack, reference });
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
    logger.error('Transaction retrieval error', { error: error.message, stack: error.stack, transactionId: id });
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
      logger.logPayment('Refund requested', {
        reference,
        amount: refundAmount,
        userId: req.user?.uid,
      });

      res.json({
        success: true,
        message: 'Refund request received. Manual processing required.',
        reference,
        amount: refundAmount,
        status: 'pending',
        note: 'Paystack refunds may require manual processing. Please contact support.',
      });
    } catch (error) {
      logger.error('Refund creation error', { error: error.message, stack: error.stack, reference });
      next(error);
    }
  },
];

// Paystack webhook handler
export const handleWebhook = async (req, res, next) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      logger.error('PAYSTACK_SECRET_KEY not configured');
      return res.status(500).json({
        success: false,
        error: 'Payment configuration error'
      });
    }

    const hash = req.headers['x-paystack-signature'];

    if (!hash) {
      logger.warn('Webhook signature missing', { ip: req.ip });
      return res.status(401).json({
        success: false,
        error: 'Missing webhook signature'
      });
    }

    // CRITICAL FIX: req.body is a Buffer when using express.raw()
    // Convert Buffer to string for signature verification
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha512', secret)
      .update(rawBody)
      .digest('hex');

    if (hash !== expectedSignature) {
      logger.warn('Invalid webhook signature', {
        ip: req.ip,
        expectedSignature: expectedSignature.substring(0, 10) + '...',
        receivedSignature: hash.substring(0, 10) + '...',
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // Parse the event data
    const event = JSON.parse(rawBody);

    logger.info(`Paystack webhook received: ${event.event}`, { eventType: event.event });

    // Handle different webhook events
    switch (event.event) {
      case 'charge.success':
        logger.logPayment('Payment successful (webhook)', {
          reference: event.data.reference,
          amount: event.data.amount,
          customer: event.data.customer.email
        });

        // Get booking ID from metadata
        const bookingId = event.data.metadata?.bookingId;

        if (bookingId) {
          try {
            // Fetch booking from Firestore
            const bookingRef = db.collection('bookings').doc(bookingId);
            const bookingDoc = await bookingRef.get();

            if (bookingDoc.exists) {
              const paymentReference = event.data.reference;
              const verifiedAt = new Date().toISOString();

              // Update booking payment status
              await bookingRef.update({
                paymentStatus: 'paid',
                paymentId: paymentReference,
                paymentVerifiedAt: verifiedAt,
                updatedAt: verifiedAt
              });

              // Get booking data and normalize passengerInfo
              const bookingData = bookingDoc.data();

              // Handle passengerInfo as array (new format) or object (legacy format)
              const normalizedPassengerInfo = Array.isArray(bookingData.passengerInfo)
                ? bookingData.passengerInfo[0]
                : bookingData.passengerInfo;

              // Construct booking object with normalized data and updated payment fields
              const booking = {
                id: bookingId,
                ...bookingData,
                passengerInfo: normalizedPassengerInfo,
                paymentStatus: 'paid',
                paymentId: paymentReference,
                paymentVerifiedAt: verifiedAt
              };

              logger.info(`Booking ${bookingId} updated with payment ${paymentReference}`);

              // Send confirmation email with PDF ticket
              try {
                if (!normalizedPassengerInfo?.email) {
                  logger.error(`No email found for booking ${bookingId}`, { passengerInfo: normalizedPassengerInfo });
                } else {
                  logger.info(`Sending confirmation email to ${normalizedPassengerInfo.email} for booking ${bookingId}`);
                  const emailResult = await sendBookingEmail(booking, 'confirmed');
                  if (emailResult.success) {
                    logger.info(`Booking confirmation email sent for ${bookingId}`);
                  } else {
                    logger.warn(`Email failed for booking ${bookingId}: ${emailResult.message}`);
                  }
                }
              } catch (emailError) {
                logger.error(`Email error for booking ${bookingId}:`, emailError);
              }
            } else {
              logger.warn(`Booking not found for payment: ${bookingId}`);
            }
          } catch (dbError) {
            logger.error(`Database error processing payment webhook:`, dbError);
          }
        } else {
          logger.warn('Payment webhook missing bookingId in metadata', {
            reference: event.data.reference
          });
        }
        break;

      case 'charge.failed':
        logger.warn('Payment failed (webhook)', {
          reference: event.data.reference,
          message: event.data.gateway_response
        });
        // TODO: Update booking status to failed
        // TODO: Send payment failed notification
        break;

      case 'transfer.success':
        logger.logPayment('Transfer successful (webhook)', {
          reference: event.data.reference,
          amount: event.data.amount,
        });
        // TODO: Handle refund completion
        break;

      case 'transfer.failed':
        logger.warn('Transfer failed (webhook)', {
          reference: event.data.reference,
          message: event.data.message,
        });
        // TODO: Handle refund failure
        break;

      default:
        logger.info('Unhandled webhook event', { eventType: event.event });
    }

    // Always return 200 to Paystack to acknowledge receipt
    res.status(200).json({ success: true, received: true });
  } catch (error) {
    logger.error('Webhook processing error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip,
    });

    // Still return 200 to prevent Paystack retries for parsing errors
    // Log the error for manual investigation
    res.status(200).json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message
    });
  }
};