// src/components/BookingConfirmationModal.tsx
import React, { useEffect } from 'react';
import { MdClose, MdCheckCircle, MdFlight, MdPerson, MdEventSeat, MdPayment, MdEmail } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../types';

interface BookingConfirmationModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  emailSent: boolean;
}

const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  isOpen,
  onClose,
  emailSent
}) => {
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

  const handleViewBookings = () => {
    navigate('/my-bookings');
    onClose();
  };

  if (!isOpen || !booking) return null;

  // Format date and time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Calculate duration
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white p-6 rounded-t-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <MdClose className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <MdCheckCircle className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
              <p className="text-cyan-100 text-sm">Your flight has been successfully booked</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Booking Reference */}
          <div className="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded">
            <p className="text-sm text-gray-600 uppercase tracking-wide mb-1">Booking Reference</p>
            <p className="text-2xl font-bold text-cyan-600 font-mono">{booking.id}</p>
          </div>

          {/* Email Status */}
          {emailSent && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-center gap-3">
              <MdEmail className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Confirmation email sent</p>
                <p className="text-sm text-green-700">Check your inbox at {booking.passengerInfo.email}</p>
              </div>
            </div>
          )}

          {/* Flight Details */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b">
              <MdFlight className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-lg">Flight Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Airline:</span>
                <span className="font-medium">{booking.flightDetails.airline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Route:</span>
                <span className="font-medium">
                  {booking.flightDetails.departureAirport} → {booking.flightDetails.arrivalAirport}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure:</span>
                <span className="font-medium">{formatDateTime(booking.flightDetails.departureTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arrival:</span>
                <span className="font-medium">{formatDateTime(booking.flightDetails.arrivalTime)}</span>
              </div>
              {booking.flightDetails.duration && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{formatDuration(booking.flightDetails.duration)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Stops:</span>
                <span className="font-medium">
                  {booking.flightDetails.stops === 0 ? 'Non-stop' : `${booking.flightDetails.stops} stop(s)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cabin Class:</span>
                <span className="font-medium capitalize">{booking.flightDetails.cabinClass || 'Economy'}</span>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b">
              <MdPerson className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-lg">Passenger Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {booking.passengerInfo.firstName} {booking.passengerInfo.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{booking.passengerInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{booking.passengerInfo.phone}</span>
              </div>
            </div>
          </div>

          {/* Seat Selection */}
          {booking.selectedSeats && booking.selectedSeats.length > 0 && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                <MdEventSeat className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-lg">Seat Selection</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.selectedSeats.map((seat, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium"
                  >
                    {seat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Payment Details */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b">
              <MdPayment className="w-5 h-5 text-cyan-600" />
              <h3 className="font-bold text-lg">Payment Information</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-xl text-green-600">
                  {booking.currency} {booking.totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="font-medium text-green-600">✓ PAID</span>
              </div>
              {booking.paymentId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Reference:</span>
                  <span className="font-medium font-mono text-xs">{booking.paymentId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date:</span>
                <span className="font-medium">
                  {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> Please arrive at the airport at least 2-3 hours before your departure time. Bring a valid ID and this booking confirmation.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleViewBookings}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
