import React, { useState, useEffect } from 'react';
import { MdCreditCard, MdLock, MdEmail, MdPerson } from 'react-icons/md';
import paystackService, { PaystackResponse } from '../services/paystackService';
import toast from 'react-hot-toast';

interface PaymentFormProps {
  amount: number;
  currency: string;
  email: string;
  bookingId?: string;
  passengerName?: string;
  onPaymentSuccess: (response: PaystackResponse) => void;
  onPaymentError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  currency,
  email,
  bookingId,
  passengerName,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  // Get currency symbol and locale based on currency code
  const currencyCode = currency?.toUpperCase() || 'GHS';
  const currencySymbol = paystackService.getCurrencySymbol(currencyCode);
  const locale = paystackService.getLocale(currencyCode);

  useEffect(() => {
    // Check if Paystack is loaded
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max

    const checkPaystack = () => {
      attempts++;
      if (window.PaystackPop) {
        console.log('✅ Paystack loaded successfully');
        setPaystackLoaded(true);
      } else if (attempts < maxAttempts) {
        setTimeout(checkPaystack, 100);
      } else {
        console.error('❌ Failed to load Paystack after 5 seconds');
        setErrorMessage('Payment system failed to load. Please refresh the page.');
        toast.error('Payment system not available. Please refresh the page.');
      }
    };
    checkPaystack();
  }, []);

  const handlePayment = async () => {
    if (!paystackLoaded) {
      const message = 'Payment system not ready. Please wait or refresh the page.';
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    // Validate public key
    const publicKey = paystackService.getPublicKey();
    if (!publicKey || publicKey === '') {
      const message = 'Payment configuration error. Please contact support.';
      setErrorMessage(message);
      toast.error(message);
      console.error('❌ Paystack public key not configured');
      return;
    }

    console.log('💳 Initiating payment...', {
      amount,
      currency: currencyCode,
      email,
      publicKeySet: !!publicKey
    });

    setIsProcessing(true);
    setErrorMessage('');

    try {
      await paystackService.initializePayment({
        amount,
        currency: currencyCode,
        email,
        reference: bookingId ? `booking-${bookingId}-${Date.now()}` : undefined,
        metadata: {
          bookingId: bookingId || '',
          passengerName: passengerName || '',
          currency: currencyCode,
        },
        callback: (response: PaystackResponse) => {
          console.log('✅ Payment callback received:', response);
          if (response.status === 'success') {
            toast.success('Payment successful!');
            onPaymentSuccess(response);
          } else {
            const message = 'Payment was not successful';
            setErrorMessage(message);
            toast.error(message);
            onPaymentError(message);
          }
          setIsProcessing(false);
        },
        onClose: () => {
          console.log('⚠️ Payment modal closed');
          const message = 'Payment was cancelled';
          setErrorMessage(message);
          toast.info(message);
          onPaymentError(message);
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error('❌ Payment error:', err);
      const message = err instanceof Error ? err.message : 'Payment failed';
      setErrorMessage(message);
      toast.error(message);
      onPaymentError(message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center mb-6">
          <MdCreditCard className="text-green-600 text-3xl mr-2" />
          <h3 className="text-xl font-semibold text-gray-900">Secure Payment</h3>
        </div>

        <div className="flex items-center justify-center mb-4 text-sm text-gray-600">
          <MdLock className="mr-1" />
          SSL Encrypted Payment
        </div>

        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              {currencySymbol}{new Intl.NumberFormat(locale).format(amount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Intl.NumberFormat(locale, {
                style: 'currency',
                currency: currencyCode,
              }).format(amount)}
            </p>
          </div>
        </div>

        {/* Payment Details Summary */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <MdEmail className="text-gray-500 mr-3" />
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium">{email}</p>
            </div>
          </div>

          {passengerName && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <MdPerson className="text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Passenger</p>
                <p className="text-sm font-medium">{passengerName}</p>
              </div>
            </div>
          )}

          {bookingId && (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <MdCreditCard className="text-gray-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Booking ID</p>
                <p className="text-sm font-medium">{bookingId}</p>
              </div>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={!paystackLoaded || isProcessing}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            !paystackLoaded || isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            `Pay ${currencySymbol}${new Intl.NumberFormat(locale).format(amount)}`
          )}
        </button>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p>You will be redirected to Paystack secure checkout</p>
          <p className="mt-1">Powered by Paystack</p>
        </div>

        {/* Payment Methods */}
        <div className="mt-4 flex justify-center space-x-2">
          <div className="text-xs text-gray-400">Accepts:</div>
          <div className="flex space-x-1">
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Card</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Bank</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">Mobile Money</span>
            <span className="px-2 py-1 bg-gray-100 rounded text-xs">USSD</span>
          </div>
        </div>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
            <p className="font-semibold">Debug Info:</p>
            <p>Paystack Loaded: {paystackLoaded ? '✅ Yes' : '❌ No'}</p>
            <p>Public Key Set: {paystackService.getPublicKey() ? '✅ Yes' : '❌ No'}</p>
            <p>Currency: {currencyCode}</p>
            <p>Amount: {currencySymbol}{amount}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;