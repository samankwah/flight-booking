import type { FlightResult } from "../types";
import type { Seat as SeatType } from "../components/SeatSelection";

interface BookingState {
  flight: FlightResult | null;
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    paymentMethod: string;
  };
  selectedSeats: SeatType[];
  step: number;
  timestamp: number;
}

const STORAGE_KEY = 'booking_draft';
const EXPIRY_HOURS = 24;

export const useBookingState = () => {
  const saveBookingState = (state: Omit<BookingState, 'timestamp'>) => {
    const dataToSave: BookingState = {
      ...state,
      timestamp: Date.now()
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  };

  const loadBookingState = (): Omit<BookingState, 'timestamp'> | null => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    try {
      const parsed: BookingState = JSON.parse(saved);

      // Check if expired (24 hours)
      const hoursSince = (Date.now() - parsed.timestamp) / (1000 * 60 * 60);
      if (hoursSince > EXPIRY_HOURS) {
        clearBookingState();
        return null;
      }

      // Return without timestamp
      const { timestamp, ...bookingData } = parsed;
      return bookingData;
    } catch (error) {
      console.error('Error parsing saved booking state:', error);
      clearBookingState();
      return null;
    }
  };

  const clearBookingState = () => {
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const hasBookingState = (): boolean => {
    return !!sessionStorage.getItem(STORAGE_KEY);
  };

  return {
    saveBookingState,
    loadBookingState,
    clearBookingState,
    hasBookingState
  };
};
