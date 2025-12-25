// src/types/index.ts

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
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

export interface MultiCitySegment {
  id: string;
  from: Airport | null;
  to: Airport | null;
  departureDate: string;
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
  selectedSeats?: string[]; // Array of seat IDs like ["12A", "12B"]
  seatDetails?: Array<{
    id: string;
    row: number;
    column: string;
    price?: number;
  }>;
  bookingDate: string; // ISO date string
  status: "confirmed" | "pending" | "cancelled";
  totalPrice: number;
  currency: string;
  paymentId?: string;
  paymentStatus?: "paid" | "pending" | "failed";
}

// Add this to your existing types.ts file or update your FlightResult interface

export interface FlightResult {
  id: string;
  airline: string;
  airlineCode?: string; // IATA airline code (e.g., "AA", "BA", "BG")
  departureAirport: string; // IATA airport code (e.g., "LHR", "JFK", "LOS")
  arrivalAirport: string; // IATA airport code (e.g., "LHR", "JFK", "ACC")
  departureTime: string;
  arrivalTime: string;
  duration: number; // in minutes
  stops: number;
  price: number;
  currency?: string; // Currency code (e.g., "USD", "GHS", "EUR")
  cabinClass?: string;
  alliance?: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
  returnDuration?: number;
  returnStops?: number;
  itineraries?: any[]; // For multi-city flights
  isMultiCity?: boolean; // Flag to indicate multi-city flight
}

// Hotel-related types
export interface HotelSearchResult {
  type: string;
  subType: string;
  name: string;
  iataCode: string;
  relevance?: number;
  hotelIds?: string[];
  address: {
    cityName: string;
    countryCode: string;
  };
  geoCode?: {
    latitude: number;
    longitude: number;
  };
}

export interface HotelListResult {
  chainCode: string;
  iataCode: string;
  dupeId: number;
  name: string;
  hotelId: string;
  geoCode: {
    latitude: number;
    longitude: number;
  };
  address: {
    countryCode: string;
  };
  lastUpdate: string;
}

export interface HotelOffer {
  id: string;
  checkInDate: string;
  checkOutDate: string;
  rateCode?: string;
  rateFamilyEstimated?: {
    code: string;
    type: string;
  };
  commission?: {
    percentage: string;
  };
  room: {
    type: string;
    typeEstimated?: {
      category: string;
    };
    description: {
      text: string;
      lang: string;
    };
  };
  guests: {
    adults: number;
  };
  price: {
    currency: string;
    base: string;
    total: string;
    taxes?: Array<{
      code: string;
      pricingFrequency: string;
      pricingMode: string;
      amount: string;
      currency: string;
      included: boolean;
    }>;
    variations?: {
      average: {
        base: string;
      };
      changes: Array<{
        startDate: string;
        endDate: string;
        base: string;
      }>;
    };
  };
  policies?: {
    paymentType?: string;
    cancellation?: {
      amount: string;
      type: string;
      description?: string;
    };
  };
}

export interface HotelOffersResult {
  type: string;
  hotel: {
    type: string;
    hotelId: string;
    chainCode: string;
    dupeId: number;
    name: string;
    cityCode: string;
    latitude: number;
    longitude: number;
  };
  available: boolean;
  offers: HotelOffer[];
}

export interface HotelSentimentResult {
  type: string;
  numberOfReviews: number;
  numberOfRatings: number;
  hotelId: string;
  overallRating: number;
  sentiments: {
    sleepQuality?: number;
    service?: number;
    facilities?: number;
    roomComforts?: number;
    valueForMoney?: number;
    catering?: number;
    location?: number;
    internet?: number;
    pointsOfInterest?: number;
    staff?: number;
  };
}

export interface HotelSearchParams {
  keyword?: string;
  cityCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  radiusUnit?: "KM" | "MILE";
  chainCodes?: string;
  amenities?: string;
  ratings?: string;
  hotelSource?: "ALL" | "BEDBANK" | "DIRECTCHAIN";
  checkInDate?: string;
  checkOutDate?: string;
  adults?: number;
  roomQuantity?: number;
  hotelIds?: string;
  lang?: string;
  max?: number;
}

// Holiday Package types
export interface ActivityResult {
  id: string;
  type: string;
  self: {
    href: string;
    methods: string[];
  };
  name: string;
  shortDescription: string;
  geoCode: {
    latitude: string;
    longitude: string;
  };
  rating: string;
  pictures: string[];
  bookingLink: string;
  price: {
    currencyCode: string;
    amount: string;
  };
}

export interface PointOfInterestResult {
  type: string;
  subType: string;
  id: string;
  self: {
    href: string;
    methods: string[];
  };
  geoCode: {
    latitude: number;
    longitude: number;
  };
  name: string;
  category: string;
  rank: number;
  tags: string[];
}

export interface TravelRecommendationResult {
  type: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: {
    total: string;
  };
  links: {
    flightDestinations: string;
    flightOffers: string;
  };
}

export interface HolidayPackage {
  id: string;
  destination: {
    name: string;
    country: string;
    cityCode: string;
  };
  flights: {
    outbound: FlightResult;
    return: FlightResult;
    totalPrice: number;
    currency: string;
  };
  hotel: {
    name: string;
    rating: number;
    pricePerNight: number;
    totalPrice: number;
    currency: string;
    amenities: string[];
  };
  activities: ActivityResult[];
  duration: number; // in days
  totalPrice: number;
  currency: string;
  inclusions: string[];
  highlights: string[];
}

export interface HolidayPackageSearchParams {
  origin: string;
  destination?: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  children?: number;
  infants?: number;
  budget?: number;
  duration?: number;
  activities?: boolean;
  hotelRating?: number;
  packageType?: "budget" | "standard" | "luxury";
}

// Passenger details interface
export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  passportNumber?: string;
  nationality?: string;
  passengerType: "adult" | "child" | "infant";
}

// Payment information interface
export interface PaymentInfo {
  method: "paystack" | "card";
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  reference?: string;
  paidAt?: string;
  cardLast4?: string;
  cardBrand?: string;
}

// Seat details interface
export interface SeatDetails {
  id: string;
  row: number;
  column: string;
  price?: number;
  type?: "economy" | "business" | "first";
  position?: "window" | "middle" | "aisle";
  available?: boolean;
}

// Flight search parameters union type
export type FlightSearchParams = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
} | {
  segments: MultiCitySegment[];
  adults: number;
  children?: number;
  infants?: number;
  travelClass?: string;
};
