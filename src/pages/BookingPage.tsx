import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, User, Plane, CreditCard } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { flightResultsMock } from "../data/mockData";
import type { FlightResult, Booking } from "../types";

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
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const flightId = searchParams.get("flightId");
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: currentUser?.displayName?.split(" ")[0] || "",
    lastName: currentUser?.displayName?.split(" ")[1] || "",
    email: currentUser?.email || "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
    paymentMethod: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (flightId) {
      const flight = flightResultsMock.find((f) => f.id === flightId);
      if (flight) {
        setSelectedFlight(flight);
      } else {
        // Handle case where flight is not found
        navigate("/flights"); // Redirect back to flights search or a 404
      }
    } else {
      navigate("/flights"); // Redirect if no flightId is provided
    }
  }, [flightId, navigate]);

  const handleNextStep = () => {
    // Basic validation for step 1
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        setError("Please fill in all passenger information.");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedFlight) {
      setError("User not logged in or flight not selected.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
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
        bookingDate: new Date().toISOString(),
        status: "confirmed",
        totalPrice: selectedFlight.price,
        currency: selectedFlight.currency,
      };

      const docRef = await addDoc(collection(db, "bookings"), newBooking);
      console.log("Booking created with ID: ", docRef.id);
      setLoading(false);
      navigate("/confirmation"); // Navigate to a confirmation page
    } catch (err: unknown) {
      setLoading(false);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred during booking.");
      }
      console.error("Error saving booking:", err);
    }
  };

  if (!selectedFlight) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Loading flight details...</h1>
        <p>If this takes too long, please return to flight search.</p>
        <button onClick={() => navigate("/flights")} className="mt-4 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition">
          Go to Flight Search
        </button>
      </div>
    );
  }

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
              <span className="font-semibold">Flight:</span>{" "}
              {selectedFlight.airline.name} ({selectedFlight.flightNumber})
            </p>
            <p>
              <span className="font-semibold">Route:</span>{" "}
              {selectedFlight.departureAirport.city} ({selectedFlight.departureAirport.code}) to{" "}
              {selectedFlight.arrivalAirport.city} ({selectedFlight.arrivalAirport.code})
            </p>
            <p>
              <span className="font-semibold">Departure:</span>{" "}
              {selectedFlight.departureDate}, {selectedFlight.departureTime}
            </p>
            <p>
              <span className="font-semibold">Arrival:</span>{" "}
              {selectedFlight.arrivalDate}, {selectedFlight.arrivalTime}
            </p>
            <p>
              <span className="font-semibold">Duration:</span>{" "}
              {selectedFlight.duration}
            </p>
            <p>
              <span className="font-semibold">Stops:</span>{" "}
              {selectedFlight.stops === 0 ? "Nonstop" : `${selectedFlight.stops} Stop(s)`}
            </p>
            <p>
              <span className="font-semibold">Cabin Class:</span>{" "}
              {selectedFlight.cabinClass}
            </p>
            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
              Total Price: {selectedFlight.currency} {selectedFlight.price.toLocaleString()}
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
            <span className="font-medium text-gray-900 dark:text-white">
              Passenger Details
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
            <span className="font-medium text-gray-900 dark:text-white">
              Payment
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
            <span className="font-medium text-gray-900 dark:text-white">
              Confirmation
            </span>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
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

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6" /> Payment Information
              </h2>
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Payment Method
                </label>
                <div className="flex flex-wrap gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`flex items-center px-4 py-2 border rounded-lg cursor-pointer ${
                        formData.paymentMethod === method.id
                          ? "border-cyan-500 ring-2 ring-cyan-500"
                          : "border-gray-300 hover:border-cyan-500"
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, paymentMethod: method.id })
                      }
                    >
                      <img
                        src={method.logo}
                        alt={method.name}
                        className="h-8 object-contain mr-2"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {method.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {formData.paymentMethod && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      required={formData.paymentMethod !== "mtn_momo"}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="expiryDate"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      required={formData.paymentMethod !== "mtn_momo"}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cvc"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                      CVC
                    </label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      value={formData.cvc}
                      onChange={handleChange}
                      required={formData.paymentMethod !== "mtn_momo"}
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <ArrowLeft className="w-5 h-5" /> Previous
              </button>
            )}

            {step < 2 && (
              <button
                type="button"
                onClick={handleNextStep}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {step === 2 && (
              <button
                type="submit"
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? "Booking..." : "Book Now"}{" "}
                <Plane className="w-5 h-5" />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
