// Type declarations for flightApi.js

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: string;
  segments?: any[];
}

export interface AirportSearchResult {
  iataCode: string;
  name: string;
  subType: string;
  address: {
    cityName: string;
    countryCode: string;
  };
}

export function searchFlights(params: FlightSearchParams): Promise<any[]>;
export function searchAirports(keyword: string): Promise<AirportSearchResult[]>;
