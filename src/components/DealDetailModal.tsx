// src/components/DealDetailModal.tsx
import React, { useEffect } from "react";
import { MdClose as Close, MdStar as Star, MdLocationOn as MapPin } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import type { Destination, Deal } from "../types";
import { getCurrencySymbol } from "../utils/currency";

interface DealDetailModalProps {
  item: Destination | Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

const DealDetailModal: React.FC<DealDetailModalProps> = ({ item, isOpen, onClose }) => {
  const navigate = useNavigate();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Prevent scrolling on body
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';

      // Prevent wheel events
      const preventScroll = (e: WheelEvent | TouchEvent) => {
        e.preventDefault();
      };

      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('touchmove', preventScroll, { passive: false });

      return () => {
        // Restore scrolling
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.documentElement.style.overflow = '';

        // Restore scroll position
        window.scrollTo(0, scrollY);

        // Remove event listeners
        document.removeEventListener('wheel', preventScroll);
        document.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [isOpen]);

  if (!isOpen || !item) return null;

  const isDeal = 'rating' in item;

  const handleBookNow = () => {
    // For now, navigate to flights page with search parameters
    // In the future, you could convert offers/deals to flight bookings
    navigate('/flights', {
      state: {
        searchParams: {
          destination: item.name,
          country: item.country
        }
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn overflow-hidden"
      onClick={onClose}
      style={{ touchAction: 'none' }}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
            aria-label="Close modal"
          >
            <Close className="w-6 h-6 text-gray-800" />
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-6 left-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-medium">{item.country}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold drop-shadow-lg">
              {item.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1">
          {/* Rating (for deals only) */}
          {isDeal && (
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-base font-bold text-gray-900">
                  {item.rating}/5
                </span>
              </div>
              <span className="text-sm text-gray-600">
                <span className="font-semibold">{item.reviews}</span> reviews
              </span>
            </div>
          )}

          {/* Description */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">About this destination</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description ||
                `Discover the beauty of ${item.name}, ${item.country}. Experience world-class attractions,
                stunning scenery, and unforgettable moments in this amazing destination.`}
            </p>
          </div>

          {/* Highlights */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">What's included</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                Round-trip flights
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                Airport transfers
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                Travel insurance
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                24/7 customer support
              </li>
              {isDeal && (
                <>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                    Accommodation
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                    Daily breakfast
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Price Section */}
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">
                  {isDeal && item.perNight ? "Per Night" : "Starting from"}
                </p>
                <p className="text-2xl md:text-3xl font-bold text-gray-900">
                  {getCurrencySymbol(item.currency)}{item.price.toLocaleString()}
                </p>
              </div>
              {isDeal && item.perNight && (
                <p className="text-xs text-gray-500">per night</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Close
            </button>
            <button
              onClick={handleBookNow}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl text-center"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDetailModal;
