import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { MdArrowBack as ArrowLeft, MdArrowForward as ArrowRight, MdPerson as User, MdFlight as Plane, MdCreditCard as CreditCard, MdAirlineSeatReclineNormal as Seat } from "react-icons/md";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import type { FlightResult, Booking } from "../types";
import type { PaystackResponse } from "../services/paystackService";
import PaystackProvider from "../components/PaystackProvider.tsx";
import PaymentForm from "../components/PaymentForm";
import SeatSelection, { Seat as SeatType } from "../components/SeatSelection";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Mock data for payment methods (moved to be accessible)
const paymentMethods = [
  { id: "visa", name: "Visa", logo: "/assets/visa.png" },
  { id: "mastercard", name: "Mastercard", logo: "/assets/mastercard.png" },
  { id: "paypal", name: "PayPal", logo: "/assets/paypal.png" },
  { id: "mtn_momo", name: "MTN Mobile Money", logo: "/assets/MTN-MoMo.jpg" },
  { id: "gcb_pay", name: "GCB Pay", logo: "/assets/gcblogo.png" },
];

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();

  // Get flight data from navigation state
  const flightFromState = location.state?.flight as FlightResult | undefined;
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(flightFromState || null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: currentUser?.displayName?.split(" ")[0] || "",
    lastName: currentUser?.displayName?.split(" ")[1] || "",
    email: currentUser?.email || "",
    phone: "",
    paymentMethod: "card", // Default to card payment
  });
  const [selectedSeats, setSelectedSeats] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if flight data was passed via navigation state
    if (!flightFromState) {
      // No flight data provided, redirect to flight search
      toast.error("No flight selected. Please search for flights first.");
      navigate("/flights", { replace: true });
    } else {
      setSelectedFlight(flightFromState);
    }
  }, [flightFromState, navigate]);

  // Early return if no flight is selected - prevents rendering errors
  if (!selectedFlight) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <h1 className="text-2xl font-bold mb-4">Redirecting to flight search...</h1>
          <p className="text-gray-600">No flight selected. Please search for flights first.</p>
        </div>
      </div>
    );
  }

  const handleNextStep = () => {
    // Basic validation for step 1
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        const errorMsg = "Please fill in all passenger information.";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        const errorMsg = "Please enter a valid email address.";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
      // Validate phone format (basic check for digits)
      const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        const errorMsg = "Please enter a valid phone number (at least 10 digits).";
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSeatsSelected = (seats: SeatType[]) => {
    setSelectedSeats(seats);
    setStep(3); // Move to payment step
  };

  const handlePaymentSuccess = async (paystackResponse: PaystackResponse) => {
    // Critical null checks - ensure user and flight data exist
    if (!currentUser) {
      const errorMsg = "User not logged in. Please sign in and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!selectedFlight) {
      const errorMsg = "Flight information is missing. Please select a flight and try again.";
      setError(errorMsg);
      toast.error(errorMsg);
      navigate("/flights");
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Verifying payment and creating booking...");

    try {
      // Verify the payment with Paystack with timeout
      const token = await currentUser.getIdToken();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      let verificationResponse;
      try {
        verificationResponse = await fetch(`${API_BASE_URL}/payments/verify/${paystackResponse.reference}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Payment verification timed out. Please check your internet connection and try again.');
        }
        throw new Error('Failed to connect to payment server. Please check your internet connection.');
      }

      if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text();
        throw new Error(`Payment verification failed (${verificationResponse.status}): ${errorText}`);
      }

      const verificationData = await verificationResponse.json();

      if (!verificationData.success || verificationData.data?.status !== 'success') {
        throw new Error('Payment verification failed. Your payment may not have been processed. Please contact support with reference: ' + paystackResponse.reference);
      }

      // Calculate total price including seat fees
      const seatFees = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
      const totalPrice = selectedFlight.price + seatFees;

      // Create the booking record
      const newBooking: Booking = {
        id: "", // Firestore will generate this
        userId: currentUser.uid,
        flightId: selectedFlight.id,
        flightDetails: selectedFlight,
        passengerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
        },
        selectedSeats: selectedSeats.map(seat => seat.id),
        seatDetails: selectedSeats,
        bookingDate: new Date().toISOString(),
        status: "confirmed",
        totalPrice,
        currency: selectedFlight.currency || "GHS",
        paymentId: paystackResponse.reference,
        paymentStatus: "paid",
      };

      try {
        const docRef = await addDoc(collection(db, "bookings"), newBooking);
        console.log("Booking created with ID: ", docRef.id);

        // Update the booking with the Firestore ID
        await updateDoc(doc(db, "bookings", docRef.id), {
          id: docRef.id,
        });

        toast.success("Booking confirmed successfully!", { id: loadingToast });
        navigate("/confirmation"); // Navigate to a confirmation page
      } catch (firestoreError) {
        console.error("Error saving booking to Firestore:", firestoreError);
        throw new Error('Payment successful but booking creation failed. Please contact support with reference: ' + paystackResponse.reference);
      }
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred while saving your booking.";

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage, { id: loadingToast, duration: 6000 });
      console.error("Error saving booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  // Flight is guaranteed to be available here due to early return above
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Book Your Flight
      </h1>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
        {/* Flight Summary */}
        <div className="mb-8 border-b pb-6 border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Plane className="w-6 h-6" /> Flight Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <p>
              <span className="font-semibold">Airline:</span>{" "}
              {selectedFlight?.airline || 'N/A'} {selectedFlight?.airlineCode ? `(${selectedFlight.airlineCode})` : ''}
            </p>
            <p>
              <span className="font-semibold">Route:</span>{" "}
              {selectedFlight?.departureAirport || 'N/A'} to {selectedFlight?.arrivalAirport || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Departure:</span>{" "}
              {selectedFlight?.departureTime || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Arrival:</span>{" "}
              {selectedFlight?.arrivalTime || 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Duration:</span>{" "}
              {selectedFlight?.duration ? `${Math.floor(selectedFlight.duration / 60)}h ${selectedFlight.duration % 60}m` : 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Stops:</span>{" "}
              {selectedFlight?.stops === 0 ? "Nonstop" : selectedFlight?.stops ? `${selectedFlight.stops} Stop(s)` : 'N/A'}
            </p>
            <p>
              <span className="font-semibold">Cabin Class:</span>{" "}
              {selectedFlight?.cabinClass || 'Economy'}
            </p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
              Price: {selectedFlight?.currency === 'GHS' ? '₵' : selectedFlight?.currency === 'NGN' ? '₦' : '$'} {selectedFlight?.price?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Booking Steps Indicator */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                step >= 1 ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </span>
            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              Passenger
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                step >= 2 ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </span>
            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              Seats
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                step >= 3 ? "bg-cyan-600 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              3
            </span>
            <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
              Payment
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div>
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-6 h-6" /> Passenger Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && selectedFlight && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Seat className="w-6 h-6" /> Select Your Seats
              </h2>
              <SeatSelection
                flightId={selectedFlight?.id || ''}
                cabinClass={
                  selectedFlight?.cabinClass === "Economy" ? "ECONOMY" :
                  selectedFlight?.cabinClass === "Business" ? "BUSINESS" :
                  "FIRST"
                }
                passengers={1} // Could be dynamic based on passenger count
                onSeatsSelected={handleSeatsSelected}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6" /> Payment Information
              </h2>

              {selectedFlight && currentUser && (
                <PaystackProvider>
                  <PaymentForm
                    amount={(selectedFlight?.price || 0) + selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0)}
                    currency={selectedFlight?.currency || "GHS"}
                    email={formData.email}
                    bookingId={`booking-${Date.now()}`}
                    passengerName={`${formData.firstName} ${formData.lastName}`}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    isProcessing={loading}
                    setIsProcessing={setLoading}
                  />
                </PaystackProvider>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && step < 3 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-5 h-5" /> Previous
              </button>
            )}

            {step === 1 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {/* Note: Step 2 (seat selection) uses its own confirm button */}
            {/* Step 3 (payment) uses the payment form's own submit */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
