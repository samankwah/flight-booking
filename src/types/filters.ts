export interface FlightFilters {
  // API-sendable filters
  airlines?: string[];
  maxStops?: number;
  travelClass?: string;

  // Time filters
  departureTimeFromDAC?: string; // HH:MM format
  departureTimeToDAC?: string;
  departureTimeFromLHR?: string;
  departureTimeToLHR?: string;

  // Client-side filters
  priceRange?: { min: number; max: number };
  maxFlightDuration?: number; // in minutes
  maxLayoverDuration?: number; // in minutes
  alliances?: string[];
  hideBasicTickets?: boolean;

  // Sorting
  sortBy?: "cheapest" | "fastest" | "best";
}

export interface FlightSearchParams {
  from: string;
  to: string;
  departureDate: string;
  adults: number;
  returnDate?: string;
  children?: number;
  infants?: number;
  cabinClass?: string;
}
