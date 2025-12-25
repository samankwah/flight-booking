// src/components/PriceAlertButton.tsx
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { MdNotifications, MdClose } from 'react-icons/md';
import { createPriceAlert, PriceAlertData } from '../services/priceAlertApi';
import { useAuth } from '../contexts/AuthContext';

interface PriceAlertButtonProps {
  flightRoute: {
    from: string;
    to: string;
    departureDate: string;
    returnDate?: string;
  };
  currentPrice: number;
  travelClass?: string;
  passengers?: {
    adults: number;
    children?: number;
    infants?: number;
  };
}

const PriceAlertButton: React.FC<PriceAlertButtonProps> = ({
  flightRoute,
  currentPrice,
  travelClass = 'ECONOMY',
  passengers = { adults: 1 },
}) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.9)); // Default 10% less
  const [frequency, setFrequency] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAlert = async () => {
    if (!user) {
      toast.error('Please sign in to create price alerts');
      return;
    }

    if (targetPrice <= 0) {
      setError('Please enter a valid target price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const alertData: PriceAlertData = {
        route: {
          from: flightRoute.from,
          to: flightRoute.to,
          departureDate: flightRoute.departureDate,
          returnDate: flightRoute.returnDate || null,
        },
        targetPrice,
        currentPrice,
        travelClass,
        passengers,
        frequency,
        active: true,
      };

      await createPriceAlert(alertData);
      setSuccess(true);
      toast.success('Price alert created successfully!');
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show button if user is not logged in
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition"
      >
        <MdNotifications className="w-5 h-5" />
        <span className="text-sm font-medium">Set Price Alert</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create Price Alert</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <MdClose className="w-6 h-6" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">Alert Created!</p>
                <p className="text-sm text-gray-600 mt-2">
                  We'll notify you when the price drops below ${targetPrice}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Route:</span> {flightRoute.from} → {flightRoute.to}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Current Price:</span> ${currentPrice}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={(e) => setTargetPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      min="1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    We'll alert you when prices drop to or below this amount
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateAlert}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Alert'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PriceAlertButton;
