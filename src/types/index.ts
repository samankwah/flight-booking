// src/types/index.ts

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface FlightSearch {
  from: Airport;
  to: Airport;
  departureDate: Date;
  returnDate?: Date;
  passengers: PassengerInfo;
  tripType: "oneWay" | "return" | "multiCity";
  cabinClass: "economy" | "business" | "firstClass";
}

export interface PassengerInfo {
  adults: number;
  children: number;
  infants: number;
  rooms?: number;
}

export interface Airline {
  id: string;
  name: string;
  logo?: string;
  code: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  price: number;
  currency: string;
  description?: string;
}

export interface Deal extends Destination {
  rating: number;
  reviews: number;
  perNight: boolean;
  category: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  rating: number;
  comment: string;
  date?: Date;
  verified: boolean;
}

export interface Statistic {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Booking {
  id: string;
  userId: string;
  flightId: string; // Reference to the FlightResult id
  flightDetails: FlightResult; // Store a snapshot of flight details at time of booking
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bookingDate: string; // ISO date string
  status: "confirmed" | "pending" | "cancelled";
  totalPrice: number;
  currency: string;
}

export interface FlightResult {
  id: string;
  airline: Airline;
  flightNumber: string;
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string; // e.g., "10:00 AM"
  arrivalTime: string;   // e.g., "02:30 PM"
  duration: string;      // e.g., "4h 30m"
  stops: number;         // 0 for nonstop, 1 for one stop, etc.
  price: number;
  currency: string;
  departureDate: string; // e.g., "2025-01-15"
  arrivalDate: string;   // e.g., "2025-01-15"
  cabinClass: "economy" | "business" | "firstClass";
}
