import React, { useState } from "react";
import { MdCreditCard as CreditCard, MdLock as Lock } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { useLocalization } from "../contexts/LocalizationContext";
import PaystackProvider from "./PaystackProvider";
import PaymentForm from "./PaymentForm";
import AuthenticationModal from "./AuthenticationModal";
import type { FlightResult } from "../types";
import type { Seat as SeatType } from "./SeatSelection";
import type { PaystackResponse } from "../services/paystackService";

interface PaymentStepWithAuthProps {
  flight: FlightResult;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: string;
  };
  selectedSeats: SeatType[];
  onPaymentSuccess: (response: PaystackResponse) => Promise<void>;
  onPaymentError: (error: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const PaymentStepWithAuth: React.FC<PaymentStepWithAuthProps> = ({
  flight,
  formData,
  selectedSeats,
  onPaymentSuccess,
  onPaymentError,
  loading,
  setLoading
}) => {
  const { currentUser } = useAuth();
  const { convertCurrency, formatPrice, currency, language } = useLocalization();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Calculate total amount
  const convertedFlightPrice = convertCurrency(flight.price, flight.currency || 'USD');
  const seatFees = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  const totalAmount = convertedFlightPrice + seatFees;

  // If user is not authenticated, show payment preview with auth gate
  if (!currentUser) {
    return (
      <>
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6" /> Payment Summary
          </h2>

          {/* Guest Booking Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  Sign in required to complete payment
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Your booking information has been saved. Sign in or create an account to proceed with secure payment.
                </p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Flight Price</span>
                <span className="font-semibold">{formatPrice(convertedFlightPrice)}</span>
              </div>

              {selectedSeats.length > 0 && (
                <div className="flex justify-between text-gray-700">
                  <span>Seat Selection ({selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''})</span>
                  <span className="font-semibold">{formatPrice(seatFees)}</span>
                </div>
              )}

              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-cyan-600">{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Sign In to Complete Payment
          </button>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <span>•</span>
            <span>SSL Encrypted</span>
            <span>•</span>
            <span>PCI Compliant</span>
          </div>
        </div>

        <AuthenticationModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
          title="Sign in to complete booking"
          message="Create an account or sign in to proceed with secure payment"
        />
      </>
    );
  }

  // User is authenticated - show payment form
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <CreditCard className="w-6 h-6" /> Payment Information
      </h2>

      <PaystackProvider>
        <PaymentForm
          amount={totalAmount}
          currency={currency}
          language={language}
          email={formData.email}
          bookingId={`booking-${Date.now()}`}
          passengerName={`${formData.firstName} ${formData.lastName}`}
          onPaymentSuccess={onPaymentSuccess}
          onPaymentError={onPaymentError}
          isProcessing={loading}
          setIsProcessing={setLoading}
        />
      </PaystackProvider>
    </div>
  );
};

export default PaymentStepWithAuth;
