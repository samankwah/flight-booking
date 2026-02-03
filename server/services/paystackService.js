import paystackClient, { PAYSTACK_PUBLIC_KEY } from '../config/paystack.js';

class PaystackService {
  /**
   * Initialize a transaction
   * @param {Object} params - Transaction parameters
   * @param {number} params.amount - Amount in kobo (smallest currency unit)
   * @param {string} params.email - Customer email
   * @param {string} params.reference - Unique transaction reference
   * @param {string} params.currency - Currency code (NGN, GHS, ZAR, USD)
   * @param {Object} params.metadata - Additional metadata
   * @param {string} params.callback_url - Callback URL after payment
   */
  async initializeTransaction(params) {
    // Detect mode based on API key prefix (check public key when available)
    const publicKey = PAYSTACK_PUBLIC_KEY || '';
    const isLiveMode = publicKey.startsWith('pk_live_');
    const mode = isLiveMode ? 'LIVE' : 'TEST';

    // Log transaction initialization without sensitive data
    console.log(`[Paystack ${mode}] Initializing transaction: ${params.reference}`);

    if (isLiveMode) {
      console.log('[Paystack] ⚠️  LIVE MODE: Processing real payment');
    }
    try {
      const response = await paystackClient.post('/transaction/initialize', {
        amount: params.amount, // Amount in kobo
        email: params.email,
        reference: params.reference,
        currency: params.currency || 'GHS', // Support foreign currencies
        metadata: params.metadata || {},
        callback_url: params.callback_url,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
      });

      return {
        success: true,
        data: response.data.data,
        authorization_url: response.data.data.authorization_url,
        access_code: response.data.data.access_code,
        reference: response.data.data.reference,
      };
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to initialize payment');
    }
  }

  /**
   * Verify a transaction
   * @param {string} reference - Transaction reference
   */
  async verifyTransaction(reference) {
    try {
      const response = await paystackClient.get(`/transaction/verify/${reference}`);

      return {
        success: true,
        data: response.data.data,
        status: response.data.data.status,
        amount: response.data.data.amount,
        currency: response.data.data.currency,
        reference: response.data.data.reference,
        customer: response.data.data.customer,
        paid_at: response.data.data.paid_at,
      };
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to verify payment');
    }
  }

  /**
   * Get transaction details
   * @param {string} id - Transaction ID or reference
   */
  async getTransaction(id) {
    try {
      const response = await paystackClient.get(`/transaction/${id}`);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Paystack transaction fetch error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction');
    }
  }

  /**
   * List transactions with optional filters
   * @param {Object} filters - Optional filters
   */
  async listTransactions(filters = {}) {
    try {
      const response = await paystackClient.get('/transaction', { params: filters });

      return {
        success: true,
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error('Paystack list transactions error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to list transactions');
    }
  }

  /**
   * Charge authorization (for recurring payments)
   * @param {Object} params - Charge parameters
   */
  async chargeAuthorization(params) {
    try {
      const response = await paystackClient.post('/transaction/charge_authorization', params);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error('Paystack charge authorization error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to charge authorization');
    }
  }

  /**
   * Get public key for frontend
   */
  getPublicKey() {
    return PAYSTACK_PUBLIC_KEY;
  }

  /**
   * Convert amount to kobo (Paystack's smallest currency unit for NGN)
   * @param {number} amount - Amount in major currency unit
   * @param {string} currency - Currency code (default: NGN)
   */
  convertToKobo(amount, currency = 'NGN') {
    // For NGN, multiply by 100 to get kobo
    // For other currencies, you might need different conversion logic
    return Math.round(amount * 100);
  }

  /**
   * Convert from kobo back to major currency unit
   * @param {number} koboAmount - Amount in kobo
   */
  convertFromKobo(koboAmount) {
    return koboAmount / 100;
  }
}

export default new PaystackService();
