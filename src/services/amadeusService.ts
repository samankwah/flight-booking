// import type { FlightResult } from "../types";
// import { FlightFilters, FlightSearchParams } from "../types/filters";

// const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
// const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
// const AMADEUS_TOKEN_URL =
//   "https://test.api.amadeus.com/v1/security/oauth2/token";
// const AMADEUS_FLIGHT_SEARCH_URL =
//   "https://test.api.amadeus.com/v2/shopping/flight-offers";

// if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
//   throw new Error("Missing Amadeus API credentials");
// }

// let accessToken: string | null = null;
// let tokenExpiry: number = 0;

// interface AmadeusTokenResponse {
//   access_token: string;
//   expires_in: number;
//   token_type: string;
// }

// async function getAccessToken(): Promise<string> {
//   if (accessToken && Date.now() < tokenExpiry) {
//     return accessToken;
//   }

//   try {
//     const response = await fetch(AMADEUS_TOKEN_URL, {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         grant_type: "client_credentials",
//         client_id: AMADEUS_API_KEY,
//         client_secret: AMADEUS_API_SECRET,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to get access token: ${response.statusText}`);
//     }

//     const data: AmadeusTokenResponse = await response.json();
//     accessToken = data.access_token;
//     tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
//     return accessToken;
//   } catch (error) {
//     console.error("Error getting Amadeus access token:", error);
//     throw new Error("Failed to authenticate with Amadeus API");
//   }
// }

// function mapCabinClass(cabinClass?: string): string {
//   const mapping: { [key: string]: string } = {
//     economy: "ECONOMY",
//     "premium economy": "PREMIUM_ECONOMY",
//     business: "BUSINESS",
//     first: "FIRST",
//   };
//   return mapping[cabinClass?.toLowerCase() || "economy"] || "ECONOMY";
// }

// function timeToMinutes(timeString: string): number {
//   const match = timeString.match(/PT(\d+H)?(\d+M)?/);
//   if (!match) return 0;
//   const hours = match[1] ? parseInt(match[1]) : 0;
//   const minutes = match[2] ? parseInt(match[2]) : 0;
//   return hours * 60 + minutes;
// }

// function formatTime(isoString: string): string {
//   const date = new Date(isoString);
//   return date.toLocaleTimeString("en-US", {
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: false,
//   });
// }

// function getAirlineAlliance(code: string): string | undefined {
//   const alliances: { [key: string]: string } = {
//     AA: "Star Alliance",
//     UA: "Star Alliance",
//     DL: "SkyTeam",
//     B6: "oneworld",
//     NK: "oneworld",
//     F9: "oneworld",
//     AS: "Star Alliance",
//     WN: "oneworld",
//     BA: "oneworld",
//     AF: "SkyTeam",
//     LH: "Star Alliance",
//     QA: "oneworld",
//     EK: "oneworld",
//     SQ: "Star Alliance",
//     CA: "Star Alliance",
//     CX: "oneworld",
//     KE: "SkyTeam",
//     AM: "SkyTeam",
//   };
//   return alliances[code];
// }

// function parseFlightOffer(offer: any): FlightResult {
//   const outbound = offer.itineraries[0];
//   const returnFlight = offer.itineraries[1];

//   const outboundSegments = outbound.segments;
//   const outboundFirst = outboundSegments[0];
//   const outboundLast = outboundSegments[outboundSegments.length - 1];

//   const departureTime = formatTime(outboundFirst.departure.at);
//   const arrivalTime = formatTime(outboundLast.arrival.at);
//   const duration = timeToMinutes(outbound.duration);
//   const stops = outboundSegments.length - 1;

//   let returnDepartureTime = "";
//   let returnArrivalTime = "";
//   let returnDuration = 0;
//   let returnStops = 0;

//   if (returnFlight) {
//     const returnSegments = returnFlight.segments;
//     const returnFirst = returnSegments[0];
//     const returnLast = returnSegments[returnSegments.length - 1];

//     returnDepartureTime = formatTime(returnFirst.departure.at);
//     returnArrivalTime = formatTime(returnLast.arrival.at);
//     returnDuration = timeToMinutes(returnFlight.duration);
//     returnStops = returnSegments.length - 1;
//   }

//   const airlineCode = outboundFirst.carrierCode;
//   const airline = outboundFirst.operating?.carrierCode || airlineCode;
//   const cabinClass = outboundFirst.cabin || "ECONOMY";
//   const price = parseFloat(offer.price.total);

//   return {
//     id: offer.id,
//     airline: getAirlineName(airline),
//     departureTime,
//     arrivalTime,
//     duration,
//     stops,
//     price,
//     returnDepartureTime,
//     returnArrivalTime,
//     returnDuration,
//     returnStops,
//     cabinClass: formatCabinClass(cabinClass),
//     airlineCode: airline,
//     alliance: getAirlineAlliance(airline),
//   };
// }

// function getAirlineName(code: string): string {
//   const airlines: { [key: string]: string } = {
//     AA: "American Airlines",
//     UA: "United Airlines",
//     DL: "Delta Air Lines",
//     B6: "JetBlue Airways",
//     NK: "Spirit Airlines",
//     F9: "Frontier Airlines",
//     AS: "Alaska Airlines",
//     WN: "Southwest Airlines",
//     BA: "British Airways",
//     AF: "Air France",
//     LH: "Lufthansa",
//     QA: "Qatar Airways",
//     EK: "Emirates",
//     SQ: "Singapore Airlines",
//     CA: "Air China",
//     CX: "Cathay Pacific",
//     KE: "Korean Air",
//     AM: "Aeromexico",
//     UL: "SriLankan Airlines",
//     KU: "Kuwait Airways",
//     MS: "EgyptAir",
//     GF: "Gulf Air",
//     BG: "Biman Bangladesh Airlines",
//     QR: "Qatar Airways",
//   };
//   return airlines[code] || code;
// }

// function formatCabinClass(cabin: string): string {
//   const mapping: { [key: string]: string } = {
//     ECONOMY: "Economy",
//     PREMIUM_ECONOMY: "Premium Economy",
//     BUSINESS: "Business",
//     FIRST: "First Class",
//   };
//   return mapping[cabin] || cabin;
// }

// // **KEY FIX: Proper client-side filtering logic**
// function applyClientSideFilters(
//   flights: FlightResult[],
//   filters: FlightFilters
// ): FlightResult[] {
//   return flights.filter((flight) => {
//     // Price range filter
//     if (filters.priceRange) {
//       if (
//         flight.price < filters.priceRange.min ||
//         flight.price > filters.priceRange.max
//       ) {
//         return false;
//       }
//     }

//     // Flight duration filter
//     if (filters.maxFlightDuration) {
//       if (flight.duration > filters.maxFlightDuration) {
//         return false;
//       }
//     }

//     // Alliances filter - **FIXED: Proper OR logic**
//     if (filters.alliances && filters.alliances.length > 0) {
//       if (!flight.alliance || !filters.alliances.includes(flight.alliance)) {
//         return false;
//       }
//     }

//     // Hide basic tickets
//     if (filters.hideBasicTickets && flight.cabinClass === "Economy") {
//       return false;
//     }

//     return true;
//   });
// }

// function sortFlights(flights: FlightResult[], sortBy?: string): FlightResult[] {
//   const sorted = [...flights];

//   switch (sortBy) {
//     case "cheapest":
//       return sorted.sort((a, b) => a.price - b.price);
//     case "fastest":
//       return sorted.sort((a, b) => a.duration - b.duration);
//     case "best":
//       return sorted.sort((a, b) => a.price / a.duration - b.price / b.duration);
//     default:
//       return sorted;
//   }
// }

// export async function searchFlights(
//   params: FlightSearchParams,
//   filters?: FlightFilters
// ): Promise<FlightResult[]> {
//   try {
//     const token = await getAccessToken();

//     const queryParams = new URLSearchParams({
//       originLocationCode: params.from,
//       destinationLocationCode: params.to,
//       departureDate: params.departureDate,
//       adults: params.adults.toString(),
//       max: "250",
//       currencyCode: "USD",
//     });

//     // **FIX: Only add airlines if provided (not empty array)**
//     if (filters?.airlines && filters.airlines.length > 0) {
//       queryParams.append("includedAirlineCodes", filters.airlines.join(","));
//     }

//     if (filters?.maxStops !== undefined) {
//       queryParams.append("maxStops", filters.maxStops.toString());
//     }

//     if (filters?.travelClass) {
//       queryParams.append("travelClass", filters.travelClass);
//     }

//     if (params.returnDate) {
//       queryParams.append("returnDate", params.returnDate);
//     }

//     if (params.children && params.children > 0) {
//       queryParams.append("children", params.children.toString());
//     }

//     if (params.infants && params.infants > 0) {
//       queryParams.append("infants", params.infants.toString());
//     }

//     const url = `${AMADEUS_FLIGHT_SEARCH_URL}?${queryParams.toString()}`;

//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(
//         errorData.errors?.[0]?.detail || "Failed to fetch flights"
//       );
//     }

//     const data = await response.json();

//     if (!data.data || data.data.length === 0) {
//       return [];
//     }

//     let flights = data.data.map(parseFlightOffer);

//     // Apply client-side filters
//     if (filters) {
//       flights = applyClientSideFilters(flights, filters);
//     }

//     // Apply sorting
//     flights = sortFlights(flights, filters?.sortBy);

//     return flights;
//   } catch (error) {
//     console.error("Error searching flights:", error);
//     throw error;
//   }
// }

// export default { searchFlights };

// import type { FlightResult } from "../types";

// const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
// const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
// const AMADEUS_BASE_URL = "https://test.api.amadeus.com/v1";

// let accessToken: string | null = null;
// let tokenExpiry: number | null = null;

// // Get OAuth2 access token
// async function getAccessToken(): Promise<string> {
//   // Return cached token if still valid
//   if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
//     return accessToken;
//   }

//   const response = await fetch(
//     `${AMADEUS_BASE_URL}/security/oauth2/token`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       body: new URLSearchParams({
//         grant_type: "client_credentials",
//         client_id: AMADEUS_API_KEY,
//         client_secret: AMADEUS_API_SECRET,
//       }),
//     }
//   );

//   if (!response.ok) {
//     throw new Error(`Failed to get access token: ${response.statusText}`);
//   }

//   const data = await response.json();
//   accessToken = data.access_token;
//   // Set expiry to 5 minutes before actual expiry for safety
//   tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

//   return accessToken;
// }

// // Helper function to calculate duration in minutes
// function calculateDuration(departure: string, arrival: string): number {
//   const dep = new Date(departure);
//   const arr = new Date(arrival);
//   return Math.round((arr.getTime() - dep.getTime()) / 60000);
// }

// // Helper function to format time from ISO string
// function formatTime(isoString: string): string {
//   const date = new Date(isoString);
//   const hours = date.getHours().toString().padStart(2, "0");
//   const minutes = date.getMinutes().toString().padStart(2, "0");
//   return `${hours}:${minutes}`;
// }

// // Helper function to get airline name from IATA code
// function getAirlineName(iataCode: string): string {
//   const airlines: Record<string, string> = {
//     AA: "American Airlines",
//     UA: "United Airlines",
//     DL: "Delta Air Lines",
//     BA: "British Airways",
//     LH: "Lufthansa",
//     AF: "Air France",
//     KL: "KLM",
//     EK: "Emirates",
//     QR: "Qatar Airways",
//     TK: "Turkish Airlines",
//     SQ: "Singapore Airlines",
//     EY: "Etihad Airways",
//     QF: "Qantas",
//     AC: "Air Canada",
//     NH: "ANA",
//     JL: "Japan Airlines",
//     CX: "Cathay Pacific",
//     VS: "Virgin Atlantic",
//     IB: "Iberia",
//     AZ: "ITA Airways",
//     OS: "Austrian Airlines",
//     LX: "SWISS",
//     SK: "SAS",
//     AY: "Finnair",
//     TP: "TAP Portugal",
//     SN: "Brussels Airlines",
//     LO: "LOT Polish",
//     OK: "Czech Airlines",
//     RO: "TAROM",
//     JU: "Air Serbia",
//     A3: "Aegean Airlines",
//     U2: "easyJet",
//     FR: "Ryanair",
//     WN: "Southwest",
//     B6: "JetBlue",
//     AS: "Alaska Airlines",
//     NK: "Spirit Airlines",
//     F9: "Frontier Airlines",
//   };

//   return airlines[iataCode] || iataCode;
// }

// interface FlightSearchParams {
//   from: string;
//   to: string;
//   departureDate: string;
//   adults: number;
//   returnDate?: string;
//   children?: number;
//   infants?: number;
//   cabinClass?: string;
// }

// export async function searchFlights(
//   params: FlightSearchParams
// ): Promise<FlightResult[]> {
//   try {
//     const token = await getAccessToken();

//     // Build query parameters
//     const queryParams = new URLSearchParams({
//       originLocationCode: params.from,
//       destinationLocationCode: params.to,
//       departureDate: params.departureDate,
//       adults: params.adults.toString(),
//       max: "50", // Get up to 50 results
//       currencyCode: "USD",
//     });

//     // Add optional parameters
//     if (params.returnDate) {
//       queryParams.append("returnDate", params.returnDate);
//     }

//     if (params.children && params.children > 0) {
//       queryParams.append("children", params.children.toString());
//     }

//     if (params.infants && params.infants > 0) {
//       queryParams.append("infants", params.infants.toString());
//     }

//     if (params.cabinClass) {
//       const cabinMap: Record<string, string> = {
//         economy: "ECONOMY",
//         "premium economy": "PREMIUM_ECONOMY",
//         business: "BUSINESS",
//         first: "FIRST",
//       };
//       const travelClass = cabinMap[params.cabinClass.toLowerCase()];
//       if (travelClass) {
//         queryParams.append("travelClass", travelClass);
//       }
//     }

//     const response = await fetch(
//       `https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("Amadeus API error:", errorData);
//       throw new Error(
//         `Flight search failed: ${errorData.errors?.[0]?.detail || response.statusText}`
//       );
//     }

//     const data = await response.json();

//     // Transform Amadeus response to FlightResult format
//     const flights: FlightResult[] = data.data.map((offer: any) => {
//       // Get outbound itinerary (first itinerary)
//       const outbound = offer.itineraries[0];
//       const outboundSegments = outbound.segments;
//       const firstSegment = outboundSegments[0];
//       const lastSegment = outboundSegments[outboundSegments.length - 1];

//       // Calculate total duration and stops for outbound
//       const outboundDuration = calculateDuration(
//         firstSegment.departure.at,
//         lastSegment.arrival.at
//       );
//       const outboundStops = outboundSegments.length - 1;

//       // Get carrier information
//       const carrierCode = firstSegment.carrierCode;
//       const airlineName = getAirlineName(carrierCode);

//       // Get price
//       const price = parseFloat(offer.price.total);

//       // Get cabin class
//       const cabinClass =
//         offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ||
//         "Economy";

//       // Base flight result
//       const flightResult: FlightResult = {
//         id: offer.id,
//         airline: airlineName,
//         airlineCode: carrierCode, // Add the IATA code
//         departureTime: formatTime(firstSegment.departure.at),
//         arrivalTime: formatTime(lastSegment.arrival.at),
//         duration: outboundDuration,
//         stops: outboundStops,
//         price: Math.round(price),
//         cabinClass: cabinClass,
//       };

//       // Add return flight information if available
//       if (offer.itineraries.length > 1) {
//         const returnItinerary = offer.itineraries[1];
//         const returnSegments = returnItinerary.segments;
//         const returnFirstSegment = returnSegments[0];
//         const returnLastSegment = returnSegments[returnSegments.length - 1];

//         flightResult.returnDepartureTime = formatTime(
//           returnFirstSegment.departure.at
//         );
//         flightResult.returnArrivalTime = formatTime(
//           returnLastSegment.arrival.at
//         );
//         flightResult.returnDuration = calculateDuration(
//           returnFirstSegment.departure.at,
//           returnLastSegment.arrival.at
//         );
//         flightResult.returnStops = returnSegments.length - 1;
//       }

//       return flightResult;
//     });

//     return flights;
//   } catch (error) {
//     console.error("Error searching flights:", error);
//     if (error instanceof Error) {
//       throw error;
//     }
//     throw new Error("An unexpected error occurred while searching flights");
//   }
// }

// import type { FlightResult } from "../types";

// const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
// const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
// const AMADEUS_BASE_URL = "https://test.api.amadeus.com/v1";

// let accessToken: string | null = null;
// let tokenExpiry: number | null = null;

// // Get OAuth2 access token
// async function getAccessToken(): Promise<string> {
//   // Return cached token if still valid
//   if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
//     return accessToken;
//   }

//   const response = await fetch(`${AMADEUS_BASE_URL}/security/oauth2/token`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams({
//       grant_type: "client_credentials",
//       client_id: AMADEUS_API_KEY,
//       client_secret: AMADEUS_API_SECRET,
//     }),
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to get access token: ${response.statusText}`);
//   }

//   const data = await response.json();
//   accessToken = data.access_token;
//   // Set expiry to 5 minutes before actual expiry for safety
//   tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

//   return accessToken;
// }

// // Helper function to calculate duration in minutes
// function calculateDuration(departure: string, arrival: string): number {
//   const dep = new Date(departure);
//   const arr = new Date(arrival);
//   return Math.round((arr.getTime() - dep.getTime()) / 60000);
// }

// // Helper function to format time from ISO string
// function formatTime(isoString: string): string {
//   const date = new Date(isoString);
//   const hours = date.getHours().toString().padStart(2, "0");
//   const minutes = date.getMinutes().toString().padStart(2, "0");
//   return `${hours}:${minutes}`;
// }

// // Helper function to get airline name from IATA code
// function getAirlineName(iataCode: string): string {
//   const airlines: Record<string, string> = {
//     AA: "American Airlines",
//     UA: "United Airlines",
//     DL: "Delta Air Lines",
//     BA: "British Airways",
//     LH: "Lufthansa",
//     AF: "Air France",
//     KL: "KLM",
//     EK: "Emirates",
//     QR: "Qatar Airways",
//     TK: "Turkish Airlines",
//     SQ: "Singapore Airlines",
//     EY: "Etihad Airways",
//     QF: "Qantas",
//     AC: "Air Canada",
//     NH: "ANA",
//     JL: "Japan Airlines",
//     CX: "Cathay Pacific",
//     VS: "Virgin Atlantic",
//     IB: "Iberia",
//     AZ: "ITA Airways",
//     OS: "Austrian Airlines",
//     LX: "SWISS",
//     SK: "SAS",
//     AY: "Finnair",
//     TP: "TAP Portugal",
//     SN: "Brussels Airlines",
//     LO: "LOT Polish",
//     OK: "Czech Airlines",
//     RO: "TAROM",
//     JU: "Air Serbia",
//     A3: "Aegean Airlines",
//     U2: "easyJet",
//     FR: "Ryanair",
//     WN: "Southwest",
//     B6: "JetBlue",
//     AS: "Alaska Airlines",
//     NK: "Spirit Airlines",
//     F9: "Frontier Airlines",
//   };

//   return airlines[iataCode] || iataCode;
// }

// interface FlightSearchParams {
//   from: string;
//   to: string;
//   departureDate: string;
//   adults: number;
//   returnDate?: string;
//   children?: number;
//   infants?: number;
//   cabinClass?: string;
// }

// export async function searchFlights(
//   params: FlightSearchParams
// ): Promise<FlightResult[]> {
//   try {
//     const token = await getAccessToken();

//     // Build query parameters
//     const queryParams = new URLSearchParams({
//       originLocationCode: params.from,
//       destinationLocationCode: params.to,
//       departureDate: params.departureDate,
//       adults: params.adults.toString(),
//       max: "50", // Get up to 50 results
//       currencyCode: "USD",
//     });

//     // Add optional parameters
//     if (params.returnDate) {
//       queryParams.append("returnDate", params.returnDate);
//     }

//     if (params.children && params.children > 0) {
//       queryParams.append("children", params.children.toString());
//     }

//     if (params.infants && params.infants > 0) {
//       queryParams.append("infants", params.infants.toString());
//     }

//     if (params.cabinClass) {
//       const cabinMap: Record<string, string> = {
//         economy: "ECONOMY",
//         "premium economy": "PREMIUM_ECONOMY",
//         business: "BUSINESS",
//         first: "FIRST",
//       };
//       const travelClass = cabinMap[params.cabinClass.toLowerCase()];
//       if (travelClass) {
//         queryParams.append("travelClass", travelClass);
//       }
//     }

//     const response = await fetch(
//       `https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error("Amadeus API error:", errorData);
//       throw new Error(
//         `Flight search failed: ${
//           errorData.errors?.[0]?.detail || response.statusText
//         }`
//       );
//     }

//     const data = await response.json();

//     // Transform Amadeus response to FlightResult format
//     const flights: FlightResult[] = data.data.map((offer: any) => {
//       // Get outbound itinerary (first itinerary)
//       const outbound = offer.itineraries[0];
//       const outboundSegments = outbound.segments;
//       const firstSegment = outboundSegments[0];
//       const lastSegment = outboundSegments[outboundSegments.length - 1];

//       // Calculate total duration and stops for outbound
//       const outboundDuration = calculateDuration(
//         firstSegment.departure.at,
//         lastSegment.arrival.at
//       );
//       const outboundStops = outboundSegments.length - 1;

//       // Get carrier information
//       const carrierCode = firstSegment.carrierCode;
//       const airlineName = getAirlineName(carrierCode);

//       // Get price
//       const price = parseFloat(offer.price.total);

//       // Get cabin class
//       const cabinClass =
//         offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ||
//         "Economy";

//       // Base flight result
//       const flightResult: FlightResult = {
//         id: offer.id,
//         airline: airlineName,
//         departureTime: formatTime(firstSegment.departure.at),
//         arrivalTime: formatTime(lastSegment.arrival.at),
//         duration: outboundDuration,
//         stops: outboundStops,
//         price: Math.round(price),
//         cabinClass: cabinClass,
//       };

//       // Add return flight information if available
//       if (offer.itineraries.length > 1) {
//         const returnItinerary = offer.itineraries[1];
//         const returnSegments = returnItinerary.segments;
//         const returnFirstSegment = returnSegments[0];
//         const returnLastSegment = returnSegments[returnSegments.length - 1];

//         flightResult.returnDepartureTime = formatTime(
//           returnFirstSegment.departure.at
//         );
//         flightResult.returnArrivalTime = formatTime(
//           returnLastSegment.arrival.at
//         );
//         flightResult.returnDuration = calculateDuration(
//           returnFirstSegment.departure.at,
//           returnLastSegment.arrival.at
//         );
//         flightResult.returnStops = returnSegments.length - 1;
//       }

//       return flightResult;
//     });

//     return flights;
//   } catch (error) {
//     console.error("Error searching flights:", error);
//     if (error instanceof Error) {
//       throw error;
//     }
//     throw new Error("An unexpected error occurred while searching flights");
//   }
// }

import type { FlightResult } from "../types";

const AMADEUS_API_KEY = import.meta.env.VITE_AMADEUS_API_KEY;
const AMADEUS_API_SECRET = import.meta.env.VITE_AMADEUS_API_SECRET;
const AMADEUS_BASE_URL = "https://test.api.amadeus.com/v1";

let accessToken: string | null = null;
let tokenExpiry: number | null = null;

// Get OAuth2 access token
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch(`${AMADEUS_BASE_URL}/security/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: AMADEUS_API_KEY,
      client_secret: AMADEUS_API_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  accessToken = data.access_token;
  // Set expiry to 5 minutes before actual expiry for safety
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

  return accessToken;
}

// Helper function to calculate duration in minutes
function calculateDuration(departure: string, arrival: string): number {
  const dep = new Date(departure);
  const arr = new Date(arrival);
  return Math.round((arr.getTime() - dep.getTime()) / 60000);
}

// Helper function to format time from ISO string
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Helper function to get airline name from IATA code
function getAirlineName(iataCode: string): string {
  const airlines: Record<string, string> = {
    AA: "American Airlines",
    UA: "United Airlines",
    DL: "Delta Air Lines",
    BA: "British Airways",
    LH: "Lufthansa",
    AF: "Air France",
    KL: "KLM",
    EK: "Emirates",
    QR: "Qatar Airways",
    TK: "Turkish Airlines",
    SQ: "Singapore Airlines",
    EY: "Etihad Airways",
    QF: "Qantas",
    AC: "Air Canada",
    NH: "ANA",
    JL: "Japan Airlines",
    CX: "Cathay Pacific",
    VS: "Virgin Atlantic",
    IB: "Iberia",
    AZ: "ITA Airways",
    OS: "Austrian Airlines",
    LX: "SWISS",
    SK: "SAS",
    AY: "Finnair",
    TP: "TAP Portugal",
    SN: "Brussels Airlines",
    LO: "LOT Polish",
    OK: "Czech Airlines",
    RO: "TAROM",
    JU: "Air Serbia",
    A3: "Aegean Airlines",
    U2: "easyJet",
    FR: "Ryanair",
    WN: "Southwest",
    B6: "JetBlue",
    AS: "Alaska Airlines",
    NK: "Spirit Airlines",
    F9: "Frontier Airlines",
  };

  return airlines[iataCode] || iataCode;
}

interface FlightSearchParams {
  from: string;
  to: string;
  departureDate: string;
  adults: number;
  returnDate?: string;
  children?: number;
  infants?: number;
  cabinClass?: string;
}

export async function searchFlights(
  params: FlightSearchParams
): Promise<FlightResult[]> {
  try {
    const token = await getAccessToken();

    // Build query parameters
    const queryParams = new URLSearchParams({
      originLocationCode: params.from,
      destinationLocationCode: params.to,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
      max: "50", // Get up to 50 results
      currencyCode: "USD",
    });

    // Add optional parameters
    if (params.returnDate) {
      queryParams.append("returnDate", params.returnDate);
    }

    if (params.children && params.children > 0) {
      queryParams.append("children", params.children.toString());
    }

    if (params.infants && params.infants > 0) {
      queryParams.append("infants", params.infants.toString());
    }

    if (params.cabinClass) {
      const cabinMap: Record<string, string> = {
        economy: "ECONOMY",
        "premium economy": "PREMIUM_ECONOMY",
        business: "BUSINESS",
        first: "FIRST",
      };
      const travelClass = cabinMap[params.cabinClass.toLowerCase()];
      if (travelClass) {
        queryParams.append("travelClass", travelClass);
      }
    }

    const response = await fetch(
      `https://test.api.amadeus.com/v2/shopping/flight-offers?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Amadeus API error:", errorData);
      throw new Error(
        `Flight search failed: ${
          errorData.errors?.[0]?.detail || response.statusText
        }`
      );
    }

    const data = await response.json();

    // Transform Amadeus response to FlightResult format
    const flights: FlightResult[] = data.data.map((offer: any) => {
      // Get outbound itinerary (first itinerary)
      const outbound = offer.itineraries[0];
      const outboundSegments = outbound.segments;
      const firstSegment = outboundSegments[0];
      const lastSegment = outboundSegments[outboundSegments.length - 1];

      // Calculate total duration and stops for outbound
      const outboundDuration = calculateDuration(
        firstSegment.departure.at,
        lastSegment.arrival.at
      );
      const outboundStops = outboundSegments.length - 1;

      // Get carrier information
      const carrierCode = firstSegment.carrierCode;
      const airlineName = getAirlineName(carrierCode);

      // Get price
      const price = parseFloat(offer.price.total);

      // Get cabin class
      const cabinClass =
        offer.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin ||
        "Economy";

      // Base flight result
      const flightResult: FlightResult = {
        id: offer.id,
        airline: airlineName,
        airlineCode: carrierCode, // Add the IATA code
        departureTime: formatTime(firstSegment.departure.at),
        arrivalTime: formatTime(lastSegment.arrival.at),
        duration: outboundDuration,
        stops: outboundStops,
        price: Math.round(price),
        cabinClass: cabinClass,
      };

      // Add return flight information if available
      if (offer.itineraries.length > 1) {
        const returnItinerary = offer.itineraries[1];
        const returnSegments = returnItinerary.segments;
        const returnFirstSegment = returnSegments[0];
        const returnLastSegment = returnSegments[returnSegments.length - 1];

        flightResult.returnDepartureTime = formatTime(
          returnFirstSegment.departure.at
        );
        flightResult.returnArrivalTime = formatTime(
          returnLastSegment.arrival.at
        );
        flightResult.returnDuration = calculateDuration(
          returnFirstSegment.departure.at,
          returnLastSegment.arrival.at
        );
        flightResult.returnStops = returnSegments.length - 1;
      }

      return flightResult;
    });

    return flights;
  } catch (error) {
    console.error("Error searching flights:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while searching flights");
  }
}
