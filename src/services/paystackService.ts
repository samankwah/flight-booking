// Paystack frontend service
declare global {
  interface Window {
    PaystackPop: any;
  }
}

export interface PaystackTransactionData {
  amount: number;
  email: string;
  currency?: string; // Currency code (NGN, GHS, USD, etc.)
  reference?: string;
  metadata?: Record<string, any>;
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
}

export interface PaystackResponse {
  reference: string;
  status: 'success' | 'cancelled';
  message: string;
  transaction: string;
  trxref: string;
}

class PaystackService {
  private publicKey: string;

  constructor() {
    // Get Paystack public key from environment variables
    this.publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
  }

  /**
   * Initialize Paystack inline payment
   */
  async initializePayment(data: PaystackTransactionData): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!window.PaystackPop) {
        console.error('❌ Paystack script not loaded');
        reject(new Error('Paystack script not loaded. Please refresh the page.'));
        return;
      }

      if (!this.publicKey || this.publicKey === '') {
        console.error('❌ Paystack public key not configured');
        reject(new Error('Payment configuration error. Please contact support.'));
        return;
      }

      // Default to GHS (Ghana Cedis) since Paystack account is in Ghana
      // Paystack supports: NGN (Nigeria), GHS (Ghana), ZAR (South Africa), USD
      const currency = data.currency?.toUpperCase() || 'GHS';
      const amountInSmallestUnit = data.amount * 100; // Convert to pesewas (for GHS) or kobo (for NGN)
      const reference = data.reference || `flight-booking-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      console.log('🚀 Opening Paystack popup...', {
        currency,
        amount: data.amount,
        amountInSmallestUnit,
        email: data.email,
        reference,
        publicKey: this.publicKey.substring(0, 10) + '...'
      });

      try {
        const handler = window.PaystackPop.setup({
          key: this.publicKey,
          email: data.email,
          amount: amountInSmallestUnit,
          currency: currency,
          ref: reference,
          metadata: data.metadata || {},
          callback: (response: PaystackResponse) => {
            console.log('✅ Payment successful:', response);
            if (data.callback) {
              data.callback(response);
            }
            resolve();
          },
          onClose: () => {
            console.log('⚠️ Payment popup closed');
            if (data.onClose) {
              data.onClose();
            }
            reject(new Error('Payment cancelled by user'));
          },
        });

        handler.openIframe();
        console.log('✅ Paystack popup opened');
      } catch (error) {
        console.error('❌ Failed to open Paystack popup:', error);
        reject(error);
      }
    });
  }

  /**
   * Load Paystack script dynamically
   */
  loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  }

  /**
   * Get public key
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Convert amount to smallest currency unit (kobo for NGN, pesewas for GHS, cents for USD)
   */
  convertToSmallestUnit(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Convert from smallest currency unit to main currency unit
   */
  convertFromSmallestUnit(smallestUnitAmount: number): number {
    return smallestUnitAmount / 100;
  }

  /**
   * Get currency symbol based on currency code
   */
  getCurrencySymbol(currencyCode: string): string {
    const symbols: Record<string, string> = {
      'GHS': '₵',
      'NGN': '₦',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'ZAR': 'R',
    };
    return symbols[currencyCode.toUpperCase()] || currencyCode;
  }

  /**
   * Get locale for currency formatting
   */
  getLocale(currencyCode: string): string {
    const locales: Record<string, string> = {
      'GHS': 'en-GH',
      'NGN': 'en-NG',
      'USD': 'en-US',
      'EUR': 'en-EU',
      'GBP': 'en-GB',
      'ZAR': 'en-ZA',
    };
    return locales[currencyCode.toUpperCase()] || 'en-US';
  }
}

export default new PaystackService();
