// import type { FlightResult } from "../types";
// import { FlightFilters, FlightSearchParams } from "../types/filters";

// import type {
//   FlightResult,
//   HotelSearchResult,
//   HotelListResult,
//   HotelOffersResult,
//   HotelSentimentResult,
//   HotelSearchParams,
//   ActivityResult,
//   PointOfInterestResult,
//   TravelRecommendationResult,
//   HolidayPackage,
//   HolidayPackageSearchParams,
// } from "../types";

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

// Mock flight results for development when API credentials are not available
function getMockFlightResults(params: FlightSearchParams): FlightResult[] {
  const airlines = ["AA", "UA", "DL", "BA", "LH"];
  const durations = [360, 420, 480, 540, 600]; // in minutes
  const prices = [299, 349, 399, 449, 499, 549];

  const results: FlightResult[] = [];

  for (let i = 0; i < 8; i++) {
    const airlineCode = airlines[Math.floor(Math.random() * airlines.length)];
    const departureTime = `${String(Math.floor(Math.random() * 24)).padStart(
      2,
      "0"
    )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
    const arrivalTime = `${String(Math.floor(Math.random() * 24)).padStart(
      2,
      "0"
    )}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`;
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const price = prices[Math.floor(Math.random() * prices.length)];

    results.push({
      id: `flight-${i + 1}`,
      airline: getAirlineName(airlineCode),
      airlineCode,
      departureAirport: params.from,
      arrivalAirport: params.to,
      departureTime,
      arrivalTime,
      duration,
      stops: Math.floor(Math.random() * 3),
      price,
      cabinClass: params.cabinClass || "Economy",
    });
  }

  return results.sort((a, b) => a.price - b.price);
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
    // Check if API credentials are available
    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      console.warn(
        "Amadeus API credentials not found. Returning mock data for development."
      );
      return getMockFlightResults(params);
    }

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
        departureAirport: firstSegment.departure.iataCode,
        arrivalAirport: lastSegment.arrival.iataCode,
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

export interface AirportSearchResult {
  type: string;
  subType: string;
  name: string;
  iataCode: string;
  address: {
    cityName: string;
    countryCode: string;
  };
}

export interface NearbyAirportResult {
  iataCode: string;
  name: string;
  distance: {
    value: number;
    unit: string;
  };
  address: {
    cityName: string;
    countryCode: string;
  };
}

export async function searchAirports(
  keyword: string
): Promise<AirportSearchResult[]> {
  console.log("🔍 Searching airports for keyword:", keyword);

  if (!keyword || keyword.length < 1) {
    console.log("❌ Empty keyword, returning empty results");
    return [];
  }

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock data for development."
    );
    // Return comprehensive mock data for development - Major airports worldwide
    const allMockAirports: AirportSearchResult[] = [
      // North America
      {
        type: "location",
        subType: "AIRPORT",
        name: "John F Kennedy International",
        iataCode: "JFK",
        address: { cityName: "New York", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Los Angeles International",
        iataCode: "LAX",
        address: { cityName: "Los Angeles", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "O'Hare International",
        iataCode: "ORD",
        address: { cityName: "Chicago", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dallas Fort Worth International",
        iataCode: "DFW",
        address: { cityName: "Dallas", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Denver International",
        iataCode: "DEN",
        address: { cityName: "Denver", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Francisco International",
        iataCode: "SFO",
        address: { cityName: "San Francisco", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Seattle Tacoma International",
        iataCode: "SEA",
        address: { cityName: "Seattle", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Miami International",
        iataCode: "MIA",
        address: { cityName: "Miami", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Phoenix Sky Harbor International",
        iataCode: "PHX",
        address: { cityName: "Phoenix", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "George Bush Intercontinental",
        iataCode: "IAH",
        address: { cityName: "Houston", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Charlotte Douglas International",
        iataCode: "CLT",
        address: { cityName: "Charlotte", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Philadelphia International",
        iataCode: "PHL",
        address: { cityName: "Philadelphia", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Logan International",
        iataCode: "BOS",
        address: { cityName: "Boston", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "LaGuardia",
        iataCode: "LGA",
        address: { cityName: "New York", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Newark Liberty International",
        iataCode: "EWR",
        address: { cityName: "Newark", countryCode: "US" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Toronto Pearson International",
        iataCode: "YYZ",
        address: { cityName: "Toronto", countryCode: "CA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Vancouver International",
        iataCode: "YVR",
        address: { cityName: "Vancouver", countryCode: "CA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Montreal Trudeau International",
        iataCode: "YUL",
        address: { cityName: "Montreal", countryCode: "CA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Calgary International",
        iataCode: "YYC",
        address: { cityName: "Calgary", countryCode: "CA" },
      },

      // Europe
      {
        type: "location",
        subType: "AIRPORT",
        name: "Heathrow",
        iataCode: "LHR",
        address: { cityName: "London", countryCode: "GB" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Gatwick",
        iataCode: "LGW",
        address: { cityName: "London", countryCode: "GB" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Charles de Gaulle",
        iataCode: "CDG",
        address: { cityName: "Paris", countryCode: "FR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Orly",
        iataCode: "ORY",
        address: { cityName: "Paris", countryCode: "FR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Frankfurt International",
        iataCode: "FRA",
        address: { cityName: "Frankfurt", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Munich International",
        iataCode: "MUC",
        address: { cityName: "Munich", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Amsterdam Schiphol",
        iataCode: "AMS",
        address: { cityName: "Amsterdam", countryCode: "NL" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Brussels Airport",
        iataCode: "BRU",
        address: { cityName: "Brussels", countryCode: "BE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Zurich Airport",
        iataCode: "ZRH",
        address: { cityName: "Zurich", countryCode: "CH" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Geneva Cointrin International",
        iataCode: "GVA",
        address: { cityName: "Geneva", countryCode: "CH" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Vienna International",
        iataCode: "VIE",
        address: { cityName: "Vienna", countryCode: "AT" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Rome Fiumicino",
        iataCode: "FCO",
        address: { cityName: "Rome", countryCode: "IT" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Milan Malpensa",
        iataCode: "MXP",
        address: { cityName: "Milan", countryCode: "IT" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Barcelona El Prat",
        iataCode: "BCN",
        address: { cityName: "Barcelona", countryCode: "ES" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Madrid Barajas",
        iataCode: "MAD",
        address: { cityName: "Madrid", countryCode: "ES" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Lisbon Humberto Delgado",
        iataCode: "LIS",
        address: { cityName: "Lisbon", countryCode: "PT" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Copenhagen Airport",
        iataCode: "CPH",
        address: { cityName: "Copenhagen", countryCode: "DK" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Stockholm Arlanda",
        iataCode: "ARN",
        address: { cityName: "Stockholm", countryCode: "SE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Oslo Gardermoen",
        iataCode: "OSL",
        address: { cityName: "Oslo", countryCode: "NO" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Helsinki Vantaa",
        iataCode: "HEL",
        address: { cityName: "Helsinki", countryCode: "FI" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Athens International",
        iataCode: "ATH",
        address: { cityName: "Athens", countryCode: "GR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Warsaw Chopin",
        iataCode: "WAW",
        address: { cityName: "Warsaw", countryCode: "PL" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Prague Vaclav Havel",
        iataCode: "PRG",
        address: { cityName: "Prague", countryCode: "CZ" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Budapest Ferenc Liszt International",
        iataCode: "BUD",
        address: { cityName: "Budapest", countryCode: "HU" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bucharest Henri Coanda International",
        iataCode: "OTP",
        address: { cityName: "Bucharest", countryCode: "RO" },
      },

      // Asia
      {
        type: "location",
        subType: "AIRPORT",
        name: "Tokyo Haneda",
        iataCode: "HND",
        address: { cityName: "Tokyo", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Narita International",
        iataCode: "NRT",
        address: { cityName: "Tokyo", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Hong Kong International",
        iataCode: "HKG",
        address: { cityName: "Hong Kong", countryCode: "HK" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Incheon International",
        iataCode: "ICN",
        address: { cityName: "Seoul", countryCode: "KR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Gimpo International",
        iataCode: "GMP",
        address: { cityName: "Seoul", countryCode: "KR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Beijing Capital International",
        iataCode: "PEK",
        address: { cityName: "Beijing", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Shanghai Pudong International",
        iataCode: "PVG",
        address: { cityName: "Shanghai", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Guangzhou Baiyun International",
        iataCode: "CAN",
        address: { cityName: "Guangzhou", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Singapore Changi",
        iataCode: "SIN",
        address: { cityName: "Singapore", countryCode: "SG" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dubai International",
        iataCode: "DXB",
        address: { cityName: "Dubai", countryCode: "AE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Abu Dhabi International",
        iataCode: "AUH",
        address: { cityName: "Abu Dhabi", countryCode: "AE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Doha Hamad International",
        iataCode: "DOH",
        address: { cityName: "Doha", countryCode: "QA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kuwait International",
        iataCode: "KWI",
        address: { cityName: "Kuwait City", countryCode: "KW" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Riyadh King Khalid International",
        iataCode: "RUH",
        address: { cityName: "Riyadh", countryCode: "SA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Jeddah King Abdulaziz International",
        iataCode: "JED",
        address: { cityName: "Jeddah", countryCode: "SA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Mumbai Chhatrapati Shivaji Maharaj International",
        iataCode: "BOM",
        address: { cityName: "Mumbai", countryCode: "IN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Delhi Indira Gandhi International",
        iataCode: "DEL",
        address: { cityName: "Delhi", countryCode: "IN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bangalore Kempegowda International",
        iataCode: "BLR",
        address: { cityName: "Bangalore", countryCode: "IN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Chennai International",
        iataCode: "MAA",
        address: { cityName: "Chennai", countryCode: "IN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bangkok Suvarnabhumi",
        iataCode: "BKK",
        address: { cityName: "Bangkok", countryCode: "TH" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kuala Lumpur International",
        iataCode: "KUL",
        address: { cityName: "Kuala Lumpur", countryCode: "MY" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Jakarta Soekarno-Hatta International",
        iataCode: "CGK",
        address: { cityName: "Jakarta", countryCode: "ID" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Manila Ninoy Aquino International",
        iataCode: "MNL",
        address: { cityName: "Manila", countryCode: "PH" },
      },

      // Oceania
      {
        type: "location",
        subType: "AIRPORT",
        name: "Sydney Kingsford Smith",
        iataCode: "SYD",
        address: { cityName: "Sydney", countryCode: "AU" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Melbourne Tullamarine",
        iataCode: "MEL",
        address: { cityName: "Melbourne", countryCode: "AU" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Brisbane International",
        iataCode: "BNE",
        address: { cityName: "Brisbane", countryCode: "AU" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Perth International",
        iataCode: "PER",
        address: { cityName: "Perth", countryCode: "AU" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Auckland International",
        iataCode: "AKL",
        address: { cityName: "Auckland", countryCode: "NZ" },
      },

      // Africa
      {
        type: "location",
        subType: "AIRPORT",
        name: "Johannesburg O.R. Tambo International",
        iataCode: "JNB",
        address: { cityName: "Johannesburg", countryCode: "ZA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cape Town International",
        iataCode: "CPT",
        address: { cityName: "Cape Town", countryCode: "ZA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cairo International",
        iataCode: "CAI",
        address: { cityName: "Cairo", countryCode: "EG" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Lagos Murtala Muhammed International",
        iataCode: "LOS",
        address: { cityName: "Lagos", countryCode: "NG" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Nairobi Jomo Kenyatta International",
        iataCode: "NBO",
        address: { cityName: "Nairobi", countryCode: "KE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Addis Ababa Bole International",
        iataCode: "ADD",
        address: { cityName: "Addis Ababa", countryCode: "ET" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Casablanca Mohammed V International",
        iataCode: "CMN",
        address: { cityName: "Casablanca", countryCode: "MA" },
      },

      // South America
      {
        type: "location",
        subType: "AIRPORT",
        name: "São Paulo Guarulhos International",
        iataCode: "GRU",
        address: { cityName: "São Paulo", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Rio de Janeiro Galeão International",
        iataCode: "GIG",
        address: { cityName: "Rio de Janeiro", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Buenos Aires Ezeiza International",
        iataCode: "EZE",
        address: { cityName: "Buenos Aires", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bogotá El Dorado International",
        iataCode: "BOG",
        address: { cityName: "Bogotá", countryCode: "CO" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Lima Jorge Chávez International",
        iataCode: "LIM",
        address: { cityName: "Lima", countryCode: "PE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Santiago International",
        iataCode: "SCL",
        address: { cityName: "Santiago", countryCode: "CL" },
      },

      // Additional major airports worldwide (continuing the list)
      {
        type: "location",
        subType: "AIRPORT",
        name: "Mexico City International",
        iataCode: "MEX",
        address: { cityName: "Mexico City", countryCode: "MX" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cancun International",
        iataCode: "CUN",
        address: { cityName: "Cancun", countryCode: "MX" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Guadalajara International",
        iataCode: "GDL",
        address: { cityName: "Guadalajara", countryCode: "MX" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Puerto Vallarta International",
        iataCode: "PVR",
        address: { cityName: "Puerto Vallarta", countryCode: "MX" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Monterrey International",
        iataCode: "MTY",
        address: { cityName: "Monterrey", countryCode: "MX" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Tijuana International",
        iataCode: "TIJ",
        address: { cityName: "Tijuana", countryCode: "MX" },
      },

      // More European airports
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dublin Airport",
        iataCode: "DUB",
        address: { cityName: "Dublin", countryCode: "IE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Edinburgh Airport",
        iataCode: "EDI",
        address: { cityName: "Edinburgh", countryCode: "GB" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Manchester Airport",
        iataCode: "MAN",
        address: { cityName: "Manchester", countryCode: "GB" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Berlin Brandenburg",
        iataCode: "BER",
        address: { cityName: "Berlin", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Hamburg Airport",
        iataCode: "HAM",
        address: { cityName: "Hamburg", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dusseldorf International",
        iataCode: "DUS",
        address: { cityName: "Dusseldorf", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Stuttgart Airport",
        iataCode: "STR",
        address: { cityName: "Stuttgart", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cologne Bonn Airport",
        iataCode: "CGN",
        address: { cityName: "Cologne", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Hanover Airport",
        iataCode: "HAJ",
        address: { cityName: "Hanover", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Leipzig Halle Airport",
        iataCode: "LEJ",
        address: { cityName: "Leipzig", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Nuremberg Airport",
        iataCode: "NUE",
        address: { cityName: "Nuremberg", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dresden Airport",
        iataCode: "DRS",
        address: { cityName: "Dresden", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bremen Airport",
        iataCode: "BRE",
        address: { cityName: "Bremen", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kiel Airport",
        iataCode: "KEL",
        address: { cityName: "Kiel", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Rostock Laage Airport",
        iataCode: "RLG",
        address: { cityName: "Rostock", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Erfurt Weimar Airport",
        iataCode: "ERF",
        address: { cityName: "Erfurt", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Karlsruhe Baden-Baden Airport",
        iataCode: "FKB",
        address: { cityName: "Karlsruhe", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Saarbrucken Airport",
        iataCode: "SCN",
        address: { cityName: "Saarbrucken", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Friedrichshafen Airport",
        iataCode: "FDH",
        address: { cityName: "Friedrichshafen", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Paderborn Lippstadt Airport",
        iataCode: "PAD",
        address: { cityName: "Paderborn", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Muenster Osnabrueck International",
        iataCode: "FMO",
        address: { cityName: "Muenster", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dortmund Airport",
        iataCode: "DTM",
        address: { cityName: "Dortmund", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Weeze Airport",
        iataCode: "NRN",
        address: { cityName: "Weeze", countryCode: "DE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Memmingen Airport",
        iataCode: "FMM",
        address: { cityName: "Memmingen", countryCode: "DE" },
      },

      // More Asian airports
      {
        type: "location",
        subType: "AIRPORT",
        name: "Taipei Taoyuan International",
        iataCode: "TPE",
        address: { cityName: "Taipei", countryCode: "TW" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kaohsiung International",
        iataCode: "KHH",
        address: { cityName: "Kaohsiung", countryCode: "TW" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Osaka Kansai International",
        iataCode: "KIX",
        address: { cityName: "Osaka", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Fukuoka Airport",
        iataCode: "FUK",
        address: { cityName: "Fukuoka", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Nagoya Chubu Centrair International",
        iataCode: "NGO",
        address: { cityName: "Nagoya", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Sapporo New Chitose",
        iataCode: "CTS",
        address: { cityName: "Sapporo", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Okinawa Naha",
        iataCode: "OKA",
        address: { cityName: "Naha", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Sendai Airport",
        iataCode: "SDJ",
        address: { cityName: "Sendai", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Hiroshima Airport",
        iataCode: "HIJ",
        address: { cityName: "Hiroshima", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Okayama Airport",
        iataCode: "OKJ",
        address: { cityName: "Okayama", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kumamoto Airport",
        iataCode: "KMJ",
        address: { cityName: "Kumamoto", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kagoshima Airport",
        iataCode: "KOJ",
        address: { cityName: "Kagoshima", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Miyazaki Airport",
        iataCode: "KMI",
        address: { cityName: "Miyazaki", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Matsuyama Airport",
        iataCode: "MYJ",
        address: { cityName: "Matsuyama", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Takamatsu Airport",
        iataCode: "TAK",
        address: { cityName: "Takamatsu", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Komatsu Airport",
        iataCode: "KMQ",
        address: { cityName: "Komatsu", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Niigata Airport",
        iataCode: "KIJ",
        address: { cityName: "Niigata", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Akita Airport",
        iataCode: "AXT",
        address: { cityName: "Akita", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Yamagata Airport",
        iataCode: "GAJ",
        address: { cityName: "Yamagata", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Fukushima Airport",
        iataCode: "FKS",
        address: { cityName: "Fukushima", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Aomori Airport",
        iataCode: "AOJ",
        address: { cityName: "Aomori", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Misawa Airport",
        iataCode: "MSJ",
        address: { cityName: "Misawa", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kushiro Airport",
        iataCode: "KUH",
        address: { cityName: "Kushiro", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Obihiro Airport",
        iataCode: "OBO",
        address: { cityName: "Obihiro", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Wakkanai Airport",
        iataCode: "WKJ",
        address: { cityName: "Wakkanai", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Monbetsu Airport",
        iataCode: "MBE",
        address: { cityName: "Monbetsu", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Nakashibetsu Airport",
        iataCode: "SHB",
        address: { cityName: "Nakashibetsu", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Nemuro Nakashibetsu Airport",
        iataCode: "UBJ",
        address: { cityName: "Nemuro", countryCode: "JP" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Shanghai Hongqiao International",
        iataCode: "SHA",
        address: { cityName: "Shanghai", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Shenzhen Bao'an International",
        iataCode: "SZX",
        address: { cityName: "Shenzhen", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Chengdu Shuangliu International",
        iataCode: "CTU",
        address: { cityName: "Chengdu", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Xi'an Xianyang International",
        iataCode: "XIY",
        address: { cityName: "Xi'an", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Hangzhou Xiaoshan International",
        iataCode: "HGH",
        address: { cityName: "Hangzhou", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Qingdao Liuting International",
        iataCode: "TAO",
        address: { cityName: "Qingdao", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Wuhan Tianhe International",
        iataCode: "WUH",
        address: { cityName: "Wuhan", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Xiamen Gaoqi International",
        iataCode: "XMN",
        address: { cityName: "Xiamen", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Changsha Huanghua International",
        iataCode: "CSX",
        address: { cityName: "Changsha", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Sanya Phoenix International",
        iataCode: "SYX",
        address: { cityName: "Sanya", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Haikou Meilan International",
        iataCode: "HAK",
        address: { cityName: "Haikou", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kunming Changshui International",
        iataCode: "KMG",
        address: { cityName: "Kunming", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Taiyuan Wusu International",
        iataCode: "TYN",
        address: { cityName: "Taiyuan", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Nanning Wuxu International",
        iataCode: "NNG",
        address: { cityName: "Nanning", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Guiyang Longdongbao International",
        iataCode: "KWE",
        address: { cityName: "Guiyang", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Lanzhou Zhongchuan International",
        iataCode: "LHW",
        address: { cityName: "Lanzhou", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Yinchuan Hedong International",
        iataCode: "INC",
        address: { cityName: "Yinchuan", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Urumqi Diwopu International",
        iataCode: "URC",
        address: { cityName: "Urumqi", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Harbin Taiping International",
        iataCode: "HRB",
        address: { cityName: "Harbin", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Changchun Longjia International",
        iataCode: "CGQ",
        address: { cityName: "Changchun", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Shenyang Taoxian International",
        iataCode: "SHE",
        address: { cityName: "Shenyang", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dalian Zhoushuizi International",
        iataCode: "DLC",
        address: { cityName: "Dalian", countryCode: "CN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Qingdao Jiaodong International",
        iataCode: "TAO",
        address: { cityName: "Qingdao", countryCode: "CN" },
      },

      // More Middle East airports
      {
        type: "location",
        subType: "AIRPORT",
        name: "Tel Aviv Ben Gurion International",
        iataCode: "TLV",
        address: { cityName: "Tel Aviv", countryCode: "IL" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Beirut Rafic Hariri International",
        iataCode: "BEY",
        address: { cityName: "Beirut", countryCode: "LB" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Amman Queen Alia International",
        iataCode: "AMM",
        address: { cityName: "Amman", countryCode: "JO" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bahrain International",
        iataCode: "BAH",
        address: { cityName: "Manama", countryCode: "BH" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Muscat International",
        iataCode: "MCT",
        address: { cityName: "Muscat", countryCode: "OM" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Tehran Imam Khomeini International",
        iataCode: "IKA",
        address: { cityName: "Tehran", countryCode: "IR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Baghdad International",
        iataCode: "BGW",
        address: { cityName: "Baghdad", countryCode: "IQ" },
      },

      // More African airports
      {
        type: "location",
        subType: "AIRPORT",
        name: "Accra Kotoka International",
        iataCode: "ACC",
        address: { cityName: "Accra", countryCode: "GH" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Abuja Nnamdi Azikiwe International",
        iataCode: "ABV",
        address: { cityName: "Abuja", countryCode: "NG" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kano Mallam Aminu International",
        iataCode: "KAN",
        address: { cityName: "Kano", countryCode: "NG" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dar es Salaam Julius Nyerere International",
        iataCode: "DAR",
        address: { cityName: "Dar es Salaam", countryCode: "TZ" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Tunis Carthage International",
        iataCode: "TUN",
        address: { cityName: "Tunis", countryCode: "TN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Algiers Houari Boumediene",
        iataCode: "ALG",
        address: { cityName: "Algiers", countryCode: "DZ" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Marrakech Menara",
        iataCode: "RAK",
        address: { cityName: "Marrakech", countryCode: "MA" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Entebbe International",
        iataCode: "EBB",
        address: { cityName: "Entebbe", countryCode: "UG" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Zanzibar Abeid Amani Karume International",
        iataCode: "ZNZ",
        address: { cityName: "Zanzibar", countryCode: "TZ" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Mombasa Moi International",
        iataCode: "MBA",
        address: { cityName: "Mombasa", countryCode: "KE" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Kilimanjaro International",
        iataCode: "JRO",
        address: { cityName: "Kilimanjaro", countryCode: "TZ" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cape Verde Amilcar Cabral International",
        iataCode: "SID",
        address: { cityName: "Praia", countryCode: "CV" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Dakar Blaise Diagne International",
        iataCode: "DSS",
        address: { cityName: "Dakar", countryCode: "SN" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Abidjan Felix Houphouet Boigny International",
        iataCode: "ABJ",
        address: { cityName: "Abidjan", countryCode: "CI" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Douala International",
        iataCode: "DLA",
        address: { cityName: "Douala", countryCode: "CM" },
      },

      // More South American airports
      {
        type: "location",
        subType: "AIRPORT",
        name: "Sao Paulo Congonhas",
        iataCode: "CGH",
        address: { cityName: "São Paulo", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Brasília International",
        iataCode: "BSB",
        address: { cityName: "Brasília", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Porto Alegre Salgado Filho International",
        iataCode: "POA",
        address: { cityName: "Porto Alegre", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Recife Guararapes International",
        iataCode: "REC",
        address: { cityName: "Recife", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Salvador Deputado Luis Eduardo Magalhaes International",
        iataCode: "SSA",
        address: { cityName: "Salvador", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Fortaleza Pinto Martins International",
        iataCode: "FOR",
        address: { cityName: "Fortaleza", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Belo Horizonte Tancredo Neves International",
        iataCode: "CNF",
        address: { cityName: "Belo Horizonte", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Curitiba Afonso Pena International",
        iataCode: "CWB",
        address: { cityName: "Curitiba", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Porto Seguro Airport",
        iataCode: "BPS",
        address: { cityName: "Porto Seguro", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Florianopolis Hercilio Luz International",
        iataCode: "FLN",
        address: { cityName: "Florianópolis", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Natal Augusto Severo International",
        iataCode: "NAT",
        address: { cityName: "Natal", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "João Pessoa International",
        iataCode: "JPA",
        address: { cityName: "João Pessoa", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Aracaju Santa Maria Airport",
        iataCode: "AJU",
        address: { cityName: "Aracaju", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Maceió Zumbi dos Palmares International",
        iataCode: "MCZ",
        address: { cityName: "Maceió", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Vitória Eurico de Aguiar Salles Airport",
        iataCode: "VIX",
        address: { cityName: "Vitória", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Goiânia Santa Genoveva Airport",
        iataCode: "GYN",
        address: { cityName: "Goiânia", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Campo Grande International",
        iataCode: "CGR",
        address: { cityName: "Campo Grande", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cuiabá Marechal Rondon International",
        iataCode: "CGB",
        address: { cityName: "Cuiabá", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Manaus Eduardo Gomes International",
        iataCode: "MAO",
        address: { cityName: "Manaus", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Belém Val de Cans International",
        iataCode: "BEL",
        address: { cityName: "Belém", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Boa Vista International",
        iataCode: "BVB",
        address: { cityName: "Boa Vista", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Rio Branco International",
        iataCode: "RBR",
        address: { cityName: "Rio Branco", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Porto Velho Governador Jorge Teixeira de Oliveira International",
        iataCode: "PVH",
        address: { cityName: "Porto Velho", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Palmas Airport",
        iataCode: "PMW",
        address: { cityName: "Palmas", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Teresina Senador Petrônio Portella",
        iataCode: "THE",
        address: { cityName: "Teresina", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "São Luís Marechal Cunha Machado International",
        iataCode: "SLZ",
        address: { cityName: "São Luís", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Imperatriz Airport",
        iataCode: "IMP",
        address: { cityName: "Imperatriz", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Santarém International",
        iataCode: "STM",
        address: { cityName: "Santarém", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Macapá International",
        iataCode: "MCP",
        address: { cityName: "Macapá", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Monte Alegre Airport",
        iataCode: "MTE",
        address: { cityName: "Monte Alegre", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Altamira Airport",
        iataCode: "ATM",
        address: { cityName: "Altamira", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Marabá Airport",
        iataCode: "MAB",
        address: { cityName: "Marabá", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Carajás Airport",
        iataCode: "CKS",
        address: { cityName: "Parauapebas", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "São Félix do Xingu Airport",
        iataCode: "SXX",
        address: { cityName: "São Félix do Xingu", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Redenção Airport",
        iataCode: "RDC",
        address: { cityName: "Redenção", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Araguaína Airport",
        iataCode: "AUX",
        address: { cityName: "Araguaína", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Uberlândia-Ten. Cel. Av. César Bombonato Airport",
        iataCode: "UDI",
        address: { cityName: "Uberlândia", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Uberaba Airport",
        iataCode: "UBA",
        address: { cityName: "Uberaba", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Ribeirão Preto Airport",
        iataCode: "RAO",
        address: { cityName: "Ribeirão Preto", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bauru Airport",
        iataCode: "JTC",
        address: { cityName: "Bauru", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "São José dos Campos Airport",
        iataCode: "SJK",
        address: { cityName: "São José dos Campos", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Viracopos International",
        iataCode: "VCP",
        address: { cityName: "Campinas", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Joinville Airport",
        iataCode: "JOI",
        address: { cityName: "Joinville", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Foz do Iguaçu International",
        iataCode: "IGU",
        address: { cityName: "Foz do Iguaçu", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Chapecó Airport",
        iataCode: "XAP",
        address: { cityName: "Chapecó", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Pelotas International",
        iataCode: "PET",
        address: { cityName: "Pelotas", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bagé Airport",
        iataCode: "BGX",
        address: { cityName: "Bagé", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Uruguaiana Ruben Berta International",
        iataCode: "URG",
        address: { cityName: "Uruguaiana", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Passo Fundo Lauro Kurtz Airport",
        iataCode: "PFB",
        address: { cityName: "Passo Fundo", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Santa Maria Airport",
        iataCode: "RIA",
        address: { cityName: "Santa Maria", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Caxias do Sul Airport",
        iataCode: "CXJ",
        address: { cityName: "Caxias do Sul", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Novo Hamburgo Airport",
        iataCode: "QHV",
        address: { cityName: "Novo Hamburgo", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Canoas Airport",
        iataCode: "QDB",
        address: { cityName: "Canoas", countryCode: "BR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Buenos Aires Jorge Newbery",
        iataCode: "AEP",
        address: { cityName: "Buenos Aires", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Córdoba International",
        iataCode: "COR",
        address: { cityName: "Córdoba", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Mendoza International",
        iataCode: "MDZ",
        address: { cityName: "Mendoza", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bariloche International",
        iataCode: "BRC",
        address: { cityName: "San Carlos de Bariloche", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Iguazu International",
        iataCode: "IGR",
        address: { cityName: "Puerto Iguazú", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Ushuaia International",
        iataCode: "USH",
        address: { cityName: "Ushuaia", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Salta International",
        iataCode: "SLA",
        address: { cityName: "Salta", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Rosario International",
        iataCode: "ROS",
        address: { cityName: "Rosario", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Tucumán International",
        iataCode: "TUC",
        address: { cityName: "San Miguel de Tucumán", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Neuquén International",
        iataCode: "NQN",
        address: { cityName: "Neuquén", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Comodoro Rivadavia International",
        iataCode: "CRD",
        address: { cityName: "Comodoro Rivadavia", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Rio Gallegos International",
        iataCode: "RGL",
        address: { cityName: "Río Gallegos", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "El Calafate International",
        iataCode: "FTE",
        address: { cityName: "El Calafate", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Carlos de Bariloche Airport",
        iataCode: "BRC",
        address: { cityName: "San Carlos de Bariloche", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Martín de los Andes Airport",
        iataCode: "CPC",
        address: { cityName: "San Martín de los Andes", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Villa Gesell Airport",
        iataCode: "VLG",
        address: { cityName: "Villa Gesell", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Rafael Airport",
        iataCode: "AFA",
        address: { cityName: "San Rafael", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Catamarca International",
        iataCode: "CTC",
        address: { cityName: "Catamarca", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Jujuy Gobernador Horacio Guzmán International",
        iataCode: "JUJ",
        address: { cityName: "San Salvador de Jujuy", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Posadas International",
        iataCode: "PSS",
        address: { cityName: "Posadas", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Formosa International",
        iataCode: "FMA",
        address: { cityName: "Formosa", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Resistencia International",
        iataCode: "RES",
        address: { cityName: "Resistencia", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Corrientes International",
        iataCode: "CNQ",
        address: { cityName: "Corrientes", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Santa Fe Airport",
        iataCode: "SFN",
        address: { cityName: "Santa Fe", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Bahía Blanca Comandante Espora",
        iataCode: "BHI",
        address: { cityName: "Bahía Blanca", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Trelew Almirante Zar Airport",
        iataCode: "REL",
        address: { cityName: "Trelew", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Puerto Madryn El Tehuelche Airport",
        iataCode: "PMY",
        address: { cityName: "Puerto Madryn", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Viedma Gobernador Edgardo Castello",
        iataCode: "VDM",
        address: { cityName: "Viedma", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Antonio Oeste Airport",
        iataCode: "OES",
        address: { cityName: "San Antonio Oeste", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Zapala Airport",
        iataCode: "APZ",
        address: { cityName: "Zapala", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cutral Có Airport",
        iataCode: "CUT",
        address: { cityName: "Cutral Có", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "General Roca Airport",
        iataCode: "GNR",
        address: { cityName: "General Roca", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cipolletti Airport",
        iataCode: "CPO",
        address: { cityName: "Cipolletti", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Viedma Airport",
        iataCode: "VDM",
        address: { cityName: "Viedma", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Antonio Oeste Airport",
        iataCode: "OES",
        address: { cityName: "San Antonio Oeste", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Zapala Airport",
        iataCode: "APZ",
        address: { cityName: "Zapala", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cutral Có Airport",
        iataCode: "CUT",
        address: { cityName: "Cutral Có", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "General Roca Airport",
        iataCode: "GNR",
        address: { cityName: "General Roca", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cipolletti Airport",
        iataCode: "CPO",
        address: { cityName: "Cipolletti", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Viedma Airport",
        iataCode: "VDM",
        address: { cityName: "Viedma", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Antonio Oeste Airport",
        iataCode: "OES",
        address: { cityName: "San Antonio Oeste", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Zapala Airport",
        iataCode: "APZ",
        address: { cityName: "Zapala", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cutral Có Airport",
        iataCode: "CUT",
        address: { cityName: "Cutral Có", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "General Roca Airport",
        iataCode: "GNR",
        address: { cityName: "General Roca", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cipolletti Airport",
        iataCode: "CPO",
        address: { cityName: "Cipolletti", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Viedma Airport",
        iataCode: "VDM",
        address: { cityName: "Viedma", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "San Antonio Oeste Airport",
        iataCode: "OES",
        address: { cityName: "San Antonio Oeste", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Zapala Airport",
        iataCode: "APZ",
        address: { cityName: "Zapala", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cutral Có Airport",
        iataCode: "CUT",
        address: { cityName: "Cutral Có", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "General Roca Airport",
        iataCode: "GNR",
        address: { cityName: "General Roca", countryCode: "AR" },
      },
      {
        type: "location",
        subType: "AIRPORT",
        name: "Cipolletti Airport",
        iataCode: "CPO",
        address: { cityName: "Cipolletti", countryCode: "AR" },
      },
    ];

    // Filter airports based on keyword with flexible matching
    const lowerKeyword = keyword.toLowerCase().trim();
    const filteredResults = allMockAirports
      .filter((item) => {
        const name = item.name.toLowerCase();
        const iataCode = item.iataCode.toLowerCase();
        const cityName = item.address.cityName.toLowerCase();
        const countryCode = item.address.countryCode.toLowerCase();

        // Check for exact matches first
        if (iataCode === lowerKeyword) return true;
        if (cityName === lowerKeyword) return true;

        // Check for partial matches
        if (name.includes(lowerKeyword)) return true;
        if (iataCode.includes(lowerKeyword)) return true;
        if (cityName.includes(lowerKeyword)) return true;
        if (countryCode.includes(lowerKeyword)) return true;

        // Check for word beginnings (e.g., "new" should match "New York")
        const words = name.split(" ").concat(cityName.split(" "));
        return words.some((word) =>
          word.toLowerCase().startsWith(lowerKeyword)
        );
      })
      .slice(0, 10); // Limit to 10 results

    console.log(
      `✅ Found ${filteredResults.length} airports for "${keyword}":`,
      filteredResults.map((a) => `${a.iataCode} - ${a.name}`)
    );
    return filteredResults;
  }

  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      keyword: keyword,
      subType: "AIRPORT,CITY",
      "page[limit]": "10",
    });

    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Airport search results:", result);

    // Transform the API response to match our interface
    return result.data.map((item: any) => ({
      type: item.type,
      subType: item.subType,
      name: item.name,
      iataCode: item.iataCode,
      address: {
        cityName: item.address?.cityName || "",
        countryCode: item.address?.countryCode || "",
      },
    }));
  } catch (error) {
    console.error("❌ Error searching airports:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while searching airports");
  }
}

export async function getNearbyAirports(
  latitude: number,
  longitude: number,
  radius: number = 100
): Promise<NearbyAirportResult[]> {
  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock nearby airports for development."
    );

    // Check if coordinates are within Ghana bounds
    // Ghana coordinates: approximately 4.5°N to 11°N latitude, 3.1°W to 1.2°E longitude
    const isInGhana = latitude >= 4.5 && latitude <= 11 && longitude >= -3.1 && longitude <= 1.2;

    if (isInGhana) {
      console.log("🇬🇭 Returning Ghana airports for coordinates:", { latitude, longitude });
      return [
        {
          iataCode: "ACC",
          name: "Kotoka International Airport",
          distance: { value: 5, unit: "KM" },
          address: { cityName: "Accra", countryCode: "GH" },
        },
        {
          iataCode: "TML",
          name: "Takoradi Airport",
          distance: { value: 180, unit: "KM" },
          address: { cityName: "Takoradi", countryCode: "GH" },
        },
        {
          iataCode: "KMS",
          name: "Kumasi Airport",
          distance: { value: 250, unit: "KM" },
          address: { cityName: "Kumasi", countryCode: "GH" },
        },
      ];
    }

    // Check for other African countries (rough bounds)
    const isInAfrica = latitude >= -35 && latitude <= 37 && longitude >= -25 && longitude <= 55;
    if (isInAfrica) {
      return [
        {
          iataCode: "ADD",
          name: "Bole International Airport",
          distance: { value: 10, unit: "KM" },
          address: { cityName: "Addis Ababa", countryCode: "ET" },
        },
        {
          iataCode: "NBO",
          name: "Jomo Kenyatta International Airport",
          distance: { value: 15, unit: "KM" },
          address: { cityName: "Nairobi", countryCode: "KE" },
        },
        {
          iataCode: "JNB",
          name: "O.R. Tambo International Airport",
          distance: { value: 20, unit: "KM" },
          address: { cityName: "Johannesburg", countryCode: "ZA" },
        },
      ];
    }

    // Check for European coordinates
    const isInEurope = latitude >= 35 && latitude <= 72 && longitude >= -25 && longitude <= 70;
    if (isInEurope) {
      return [
        {
          iataCode: "LHR",
          name: "Heathrow Airport",
          distance: { value: 25, unit: "KM" },
          address: { cityName: "London", countryCode: "GB" },
        },
        {
          iataCode: "CDG",
          name: "Charles de Gaulle Airport",
          distance: { value: 20, unit: "KM" },
          address: { cityName: "Paris", countryCode: "FR" },
        },
        {
          iataCode: "FRA",
          name: "Frankfurt Airport",
          distance: { value: 12, unit: "KM" },
          address: { cityName: "Frankfurt", countryCode: "DE" },
        },
      ];
    }

    // Default to New York area for demo purposes
    console.log("📍 Returning default New York airports for coordinates:", { latitude, longitude });
    return [
      {
        iataCode: "JFK",
        name: "John F Kennedy International",
        distance: { value: 15, unit: "KM" },
        address: { cityName: "New York", countryCode: "US" },
      },
      {
        iataCode: "LGA",
        name: "LaGuardia",
        distance: { value: 12, unit: "KM" },
        address: { cityName: "New York", countryCode: "US" },
      },
      {
        iataCode: "EWR",
        name: "Newark Liberty International",
        distance: { value: 20, unit: "KM" },
        address: { cityName: "Newark", countryCode: "US" },
      },
      {
        iataCode: "PHL",
        name: "Philadelphia International",
        distance: { value: 85, unit: "KM" },
        address: { cityName: "Philadelphia", countryCode: "US" },
      },
      {
        iataCode: "BOS",
        name: "Logan International",
        distance: { value: 200, unit: "KM" },
        address: { cityName: "Boston", countryCode: "US" },
      },
    ];
  }

  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    });

    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/airports?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Nearby airports results:", result);

    // Transform the API response to match our interface
    return result.data.slice(0, 5).map((item: any) => ({
      iataCode: item.iataCode,
      name: item.name,
      distance: item.distance,
      address: {
        cityName: item.address?.cityName || "",
        countryCode: item.address?.countryCode || "",
      },
    }));
  } catch (error) {
    console.error("❌ Error getting nearby airports:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "An unexpected error occurred while getting nearby airports"
    );
  }
}

// Hotel Search Functions

/**
 * Search for hotels by name using Amadeus Hotel Name Autocomplete API
 */
export async function searchHotels(
  keyword: string,
  lang: string = "EN",
  max: number = 10
): Promise<HotelSearchResult[]> {
  console.log("🏨 Searching hotels for keyword:", keyword);

  if (!keyword || keyword.length < 1) {
    console.log("❌ Empty keyword, returning empty results");
    return [];
  }

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock hotel data for development."
    );

    // Comprehensive mock hotel data for development - Worldwide coverage
    const mockHotels: HotelSearchResult[] = [
      // Europe
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Hilton Paris Opera",
        iataCode: "PAR",
        relevance: 80,
        hotelIds: ["HLPAR266"],
        address: { cityName: "PARIS", countryCode: "FR" },
        geoCode: { latitude: 48.8757, longitude: 2.32553 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Shangri-La Hotel Paris",
        iataCode: "PAR",
        relevance: 75,
        hotelIds: ["SLPAR001"],
        address: { cityName: "PARIS", countryCode: "FR" },
        geoCode: { latitude: 48.8652, longitude: 2.3008 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Ritz London",
        iataCode: "LHR",
        relevance: 90,
        hotelIds: ["RITZ001"],
        address: { cityName: "LONDON", countryCode: "GB" },
        geoCode: { latitude: 51.5074, longitude: -0.1278 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Hotel Arts Barcelona",
        iataCode: "BCN",
        relevance: 82,
        hotelIds: ["HABCN001"],
        address: { cityName: "BARCELONA", countryCode: "ES" },
        geoCode: { latitude: 41.3851, longitude: 2.1734 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Belmond Hotel Caruso",
        iataCode: "NAP",
        relevance: 88,
        hotelIds: ["BHNAP001"],
        address: { cityName: "AMALFI", countryCode: "IT" },
        geoCode: { latitude: 40.634, longitude: 14.6029 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Plaza Hotel",
        iataCode: "NYC",
        relevance: 85,
        hotelIds: ["PLNYC001"],
        address: { cityName: "NEW YORK", countryCode: "US" },
        geoCode: { latitude: 40.7647, longitude: -73.9742 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Burj Al Arab",
        iataCode: "DXB",
        relevance: 90,
        hotelIds: ["BAJED001"],
        address: { cityName: "DUBAI", countryCode: "AE" },
        geoCode: { latitude: 25.1412, longitude: 55.1852 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Marina Bay Sands",
        iataCode: "SIN",
        relevance: 85,
        hotelIds: ["MBSIN001"],
        address: { cityName: "SINGAPORE", countryCode: "SG" },
        geoCode: { latitude: 1.2834, longitude: 103.8607 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Ritz-Carlton Tokyo",
        iataCode: "NRT",
        relevance: 87,
        hotelIds: ["RCTYO001"],
        address: { cityName: "TOKYO", countryCode: "JP" },
        geoCode: { latitude: 35.6762, longitude: 139.6503 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Four Seasons Hotel Sydney",
        iataCode: "SYD",
        relevance: 83,
        hotelIds: ["FSSYD001"],
        address: { cityName: "SYDNEY", countryCode: "AU" },
        geoCode: { latitude: -33.8688, longitude: 151.2093 },
      },

      // Africa - Including Ghana and other countries
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Labadi Beach Hotel",
        iataCode: "ACC",
        relevance: 75,
        hotelIds: ["LBHACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.6148, longitude: -0.2057 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Golden Tulip Accra",
        iataCode: "ACC",
        relevance: 78,
        hotelIds: ["GTACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.6037, longitude: -0.187 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Mövenpick Ambassador Hotel Accra",
        iataCode: "ACC",
        relevance: 80,
        hotelIds: ["MAHACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.5756, longitude: -0.1794 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Royal Senchi Hotel",
        iataCode: "ACC",
        relevance: 76,
        hotelIds: ["RSHACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.6167, longitude: -0.2056 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Alisa Hotel",
        iataCode: "ACC",
        relevance: 74,
        hotelIds: ["ALHACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.568, longitude: -0.1718 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "African Regent Hotel",
        iataCode: "ACC",
        relevance: 73,
        hotelIds: ["ARHACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.6068, longitude: -0.1889 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "La Palm Royal Beach Hotel",
        iataCode: "ACC",
        relevance: 82,
        hotelIds: ["LPRBH001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.6148, longitude: -0.2057 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Kempinski Hotel Gold Coast City",
        iataCode: "ACC",
        relevance: 85,
        hotelIds: ["KHGCC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.6037, longitude: -0.187 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Novotel Accra City Centre",
        iataCode: "ACC",
        relevance: 77,
        hotelIds: ["NACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.5756, longitude: -0.1794 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Ramada Hotel & Suites Accra",
        iataCode: "ACC",
        relevance: 75,
        hotelIds: ["RHSA001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.568, longitude: -0.1718 },
      },

      // Other African cities
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Table Bay Hotel",
        iataCode: "CPT",
        relevance: 84,
        hotelIds: ["TBHCPT001"],
        address: { cityName: "CAPE TOWN", countryCode: "ZA" },
        geoCode: { latitude: -33.9249, longitude: 18.4241 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Sandton Sun Hotel",
        iataCode: "JNB",
        relevance: 78,
        hotelIds: ["SSHJNB001"],
        address: { cityName: "JOHANNESBURG", countryCode: "ZA" },
        geoCode: { latitude: -26.2041, longitude: 28.0473 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Nairobi Serena Hotel",
        iataCode: "NBO",
        relevance: 79,
        hotelIds: ["NSHNBO001"],
        address: { cityName: "NAIROBI", countryCode: "KE" },
        geoCode: { latitude: -1.2864, longitude: 36.8172 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Southern Sun Cape Sun",
        iataCode: "CPT",
        relevance: 76,
        hotelIds: ["SSCSCPT001"],
        address: { cityName: "CAPE TOWN", countryCode: "ZA" },
        geoCode: { latitude: -33.9646, longitude: 18.4641 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Fairmont Nile City",
        iataCode: "CAI",
        relevance: 81,
        hotelIds: ["FNC001"],
        address: { cityName: "CAIRO", countryCode: "EG" },
        geoCode: { latitude: 30.0444, longitude: 31.2357 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Transcorp Hilton Abuja",
        iataCode: "ABV",
        relevance: 77,
        hotelIds: ["THABV001"],
        address: { cityName: "ABUJA", countryCode: "NG" },
        geoCode: { latitude: 9.0765, longitude: 7.3986 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Taj Cape Town",
        iataCode: "CPT",
        relevance: 80,
        hotelIds: ["TCCT001"],
        address: { cityName: "CAPE TOWN", countryCode: "ZA" },
        geoCode: { latitude: -33.9099, longitude: 18.4207 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Sheraton Addis",
        iataCode: "ADD",
        relevance: 75,
        hotelIds: ["SADD001"],
        address: { cityName: "ADDIS ABABA", countryCode: "ET" },
        geoCode: { latitude: 8.9806, longitude: 38.7578 },
      },

      // More worldwide cities
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Peninsula Hong Kong",
        iataCode: "HKG",
        relevance: 89,
        hotelIds: ["TPHK001"],
        address: { cityName: "HONG KONG", countryCode: "HK" },
        geoCode: { latitude: 22.3193, longitude: 114.1694 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Mandarin Oriental Bangkok",
        iataCode: "BKK",
        relevance: 86,
        hotelIds: ["MOBKK001"],
        address: { cityName: "BANGKOK", countryCode: "TH" },
        geoCode: { latitude: 13.7563, longitude: 100.5018 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Shangri-La Hotel Kuala Lumpur",
        iataCode: "KUL",
        relevance: 83,
        hotelIds: ["SHKUL001"],
        address: { cityName: "KUALA LUMPUR", countryCode: "MY" },
        geoCode: { latitude: 3.139, longitude: 101.6869 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Grand Hyatt Mumbai",
        iataCode: "BOM",
        relevance: 81,
        hotelIds: ["GHMBOM001"],
        address: { cityName: "MUMBAI", countryCode: "IN" },
        geoCode: { latitude: 18.922, longitude: 72.8347 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Oberoi Mumbai",
        iataCode: "BOM",
        relevance: 87,
        hotelIds: ["TOM001"],
        address: { cityName: "MUMBAI", countryCode: "IN" },
        geoCode: { latitude: 18.9207, longitude: 72.8205 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Taj Mahal Palace",
        iataCode: "BOM",
        relevance: 88,
        hotelIds: ["TMP001"],
        address: { cityName: "MUMBAI", countryCode: "IN" },
        geoCode: { latitude: 18.9222, longitude: 72.8333 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "ITC Grand Chola",
        iataCode: "MAA",
        relevance: 84,
        hotelIds: ["IGC001"],
        address: { cityName: "CHENNAI", countryCode: "IN" },
        geoCode: { latitude: 13.0827, longitude: 80.2707 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Leela Palace Chennai",
        iataCode: "MAA",
        relevance: 85,
        hotelIds: ["TLPC001"],
        address: { cityName: "CHENNAI", countryCode: "IN" },
        geoCode: { latitude: 12.9799, longitude: 80.2482 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The St. Regis Mumbai",
        iataCode: "BOM",
        relevance: 86,
        hotelIds: ["TSRM001"],
        address: { cityName: "MUMBAI", countryCode: "IN" },
        geoCode: { latitude: 18.929, longitude: 72.824 },
      },

      // More cities worldwide
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Conrad Tokyo",
        iataCode: "NRT",
        relevance: 82,
        hotelIds: ["CTYO001"],
        address: { cityName: "TOKYO", countryCode: "JP" },
        geoCode: { latitude: 35.6785, longitude: 139.7577 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Park Hyatt Tokyo",
        iataCode: "NRT",
        relevance: 88,
        hotelIds: ["PHTYO001"],
        address: { cityName: "TOKYO", countryCode: "JP" },
        geoCode: { latitude: 35.685, longitude: 139.7508 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Hotel Okura Tokyo",
        iataCode: "NRT",
        relevance: 81,
        hotelIds: ["HOTYO001"],
        address: { cityName: "TOKYO", countryCode: "JP" },
        geoCode: { latitude: 35.678, longitude: 139.736 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Rosewood London",
        iataCode: "LHR",
        relevance: 87,
        hotelIds: ["RLLHR001"],
        address: { cityName: "LONDON", countryCode: "GB" },
        geoCode: { latitude: 51.5085, longitude: -0.1257 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Claridge's",
        iataCode: "LHR",
        relevance: 89,
        hotelIds: ["CLHR001"],
        address: { cityName: "LONDON", countryCode: "GB" },
        geoCode: { latitude: 51.5136, longitude: -0.1479 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Savoy",
        iataCode: "LHR",
        relevance: 90,
        hotelIds: ["TSLHR001"],
        address: { cityName: "LONDON", countryCode: "GB" },
        geoCode: { latitude: 51.5102, longitude: -0.1205 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Hotel Adlon Kempinski Berlin",
        iataCode: "BER",
        relevance: 84,
        hotelIds: ["HAKBER001"],
        address: { cityName: "BERLIN", countryCode: "DE" },
        geoCode: { latitude: 52.5163, longitude: 13.3777 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Bayerischer Hof",
        iataCode: "MUC",
        relevance: 82,
        hotelIds: ["BHMUC001"],
        address: { cityName: "MUNICH", countryCode: "DE" },
        geoCode: { latitude: 48.1391, longitude: 11.5802 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Hotel Vier Jahreszeiten Kempinski",
        iataCode: "HAM",
        relevance: 83,
        hotelIds: ["HVJKHAM001"],
        address: { cityName: "HAMBURG", countryCode: "DE" },
        geoCode: { latitude: 53.5511, longitude: 9.9937 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Mandarin Oriental Munich",
        iataCode: "MUC",
        relevance: 85,
        hotelIds: ["MOMUC001"],
        address: { cityName: "MUNICH", countryCode: "DE" },
        geoCode: { latitude: 48.1377, longitude: 11.5798 },
      },

      // American cities
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Beverly Hills Hotel",
        iataCode: "LAX",
        relevance: 87,
        hotelIds: ["TBHHLA001"],
        address: { cityName: "LOS ANGELES", countryCode: "US" },
        geoCode: { latitude: 34.0697, longitude: -118.4004 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Waldorf Astoria Beverly Hills",
        iataCode: "LAX",
        relevance: 86,
        hotelIds: ["WABHLAX001"],
        address: { cityName: "LOS ANGELES", countryCode: "US" },
        geoCode: { latitude: 34.0678, longitude: -118.397 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Ritz-Carlton Chicago",
        iataCode: "ORD",
        relevance: 84,
        hotelIds: ["TRCCHI001"],
        address: { cityName: "CHICAGO", countryCode: "US" },
        geoCode: { latitude: 41.8781, longitude: -87.6298 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Peninsula Chicago",
        iataCode: "ORD",
        relevance: 85,
        hotelIds: ["TPCHI001"],
        address: { cityName: "CHICAGO", countryCode: "US" },
        geoCode: { latitude: 41.8924, longitude: -87.6254 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Bellagio Las Vegas",
        iataCode: "LAS",
        relevance: 83,
        hotelIds: ["BLLAS001"],
        address: { cityName: "LAS VEGAS", countryCode: "US" },
        geoCode: { latitude: 36.1121, longitude: -115.1728 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Venetian Resort",
        iataCode: "LAS",
        relevance: 82,
        hotelIds: ["TVRLAS001"],
        address: { cityName: "LAS VEGAS", countryCode: "US" },
        geoCode: { latitude: 36.1212, longitude: -115.1699 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Caesars Palace",
        iataCode: "LAS",
        relevance: 81,
        hotelIds: ["CPLAS001"],
        address: { cityName: "LAS VEGAS", countryCode: "US" },
        geoCode: { latitude: 36.1162, longitude: -115.1745 },
      },

      // Latin America
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Belmond Copacabana Palace",
        iataCode: "GIG",
        relevance: 86,
        hotelIds: ["BCPGIG001"],
        address: { cityName: "RIO DE JANEIRO", countryCode: "BR" },
        geoCode: { latitude: -22.9677, longitude: -43.1729 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Fasano Rio",
        iataCode: "GIG",
        relevance: 84,
        hotelIds: ["FRGIG001"],
        address: { cityName: "RIO DE JANEIRO", countryCode: "BR" },
        geoCode: { latitude: -22.9561, longitude: -43.1985 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Hotel das Cataratas",
        iataCode: "IGU",
        relevance: 83,
        hotelIds: ["HDCIGU001"],
        address: { cityName: "FOZ DO IGUACU", countryCode: "BR" },
        geoCode: { latitude: -25.5478, longitude: -54.5881 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Tivoli Marina Vilamoura",
        iataCode: "FAO",
        relevance: 78,
        hotelIds: ["TMVFAO001"],
        address: { cityName: "VILAMOURA", countryCode: "PT" },
        geoCode: { latitude: 37.0886, longitude: -8.1187 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Quinta do Lago",
        iataCode: "FAO",
        relevance: 82,
        hotelIds: ["QDLFAO001"],
        address: { cityName: "VILAMOURA", countryCode: "PT" },
        geoCode: { latitude: 37.0408, longitude: -8.0218 },
      },

      // More African hotels
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "One&Only Cape Town",
        iataCode: "CPT",
        relevance: 88,
        hotelIds: ["OOCT001"],
        address: { cityName: "CAPE TOWN", countryCode: "ZA" },
        geoCode: { latitude: -33.9189, longitude: 18.4233 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Ellerman House",
        iataCode: "CPT",
        relevance: 85,
        hotelIds: ["EHC001"],
        address: { cityName: "CAPE TOWN", countryCode: "ZA" },
        geoCode: { latitude: -33.9346, longitude: 18.3847 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Silo Hotel",
        iataCode: "CPT",
        relevance: 84,
        hotelIds: ["TSHC001"],
        address: { cityName: "CAPE TOWN", countryCode: "ZA" },
        geoCode: { latitude: -33.9304, longitude: 18.4187 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "The Twelve Apostles Hotel",
        iataCode: "CPT",
        relevance: 83,
        hotelIds: ["TAHC001"],
        address: { cityName: "CAPE TOWN", countryCode: "ZA" },
        geoCode: { latitude: -34.3514, longitude: 18.4968 },
      },

      // More Ghana hotels
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Holiday Inn Accra Airport",
        iataCode: "ACC",
        relevance: 74,
        hotelIds: ["HIAACC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.6037, longitude: -0.187 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Best Western Plus Atlantic Hotel",
        iataCode: "ACC",
        relevance: 73,
        hotelIds: ["BWPAH001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.5756, longitude: -0.1794 },
      },
      {
        type: "location",
        subType: "HOTEL_LEISURE",
        name: "Ecobank Ghana Conference Centre",
        iataCode: "ACC",
        relevance: 72,
        hotelIds: ["EGCC001"],
        address: { cityName: "ACCRA", countryCode: "GH" },
        geoCode: { latitude: 5.568, longitude: -0.1718 },
      },
    ];

    // Filter mock data based on keyword
    const lowerKeyword = keyword.toLowerCase().trim();
    const filteredResults = mockHotels
      .filter((hotel) => {
        const name = hotel.name.toLowerCase();
        const cityName = hotel.address.cityName.toLowerCase();
        const countryCode = hotel.address.countryCode.toLowerCase();

        // More flexible matching: check if keyword is contained in any field
        return (
          name.includes(lowerKeyword) ||
          cityName.includes(lowerKeyword) ||
          countryCode.includes(lowerKeyword) ||
          hotel.iataCode.toLowerCase().includes(lowerKeyword) ||
          // Also check if any word in the name starts with the keyword
          name
            .split(" ")
            .some((word) => word.toLowerCase().startsWith(lowerKeyword))
        );
      })
      .slice(0, max);

    console.log(
      `✅ Found ${filteredResults.length} mock hotels for "${keyword}"`
    );
    return filteredResults;
  }

  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      keyword: keyword,
      subType: "HOTEL_LEISURE",
      lang: lang,
      max: max.toString(),
    });

    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotel?${params}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Hotel search results:", result);

    return result.data.map((item: any) => ({
      type: item.type,
      subType: item.subType,
      name: item.name,
      iataCode: item.iataCode,
      relevance: item.relevance,
      hotelIds: item.hotelIds,
      address: {
        cityName: item.address?.cityName || "",
        countryCode: item.address?.countryCode || "",
      },
      geoCode: item.geoCode
        ? {
            latitude: item.geoCode.latitude,
            longitude: item.geoCode.longitude,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("❌ Error searching hotels:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while searching hotels");
  }
}

/**
 * Search for hotels by city code using Amadeus Hotel List by City API
 */
export async function searchHotelsByCity(
  params: HotelSearchParams
): Promise<HotelListResult[]> {
  const { cityCode, chainCodes, amenities, ratings, hotelSource } = params;

  console.log("🏨 Searching hotels by city:", cityCode);

  if (!cityCode) {
    throw new Error("City code is required");
  }

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock hotel list for development."
    );

    // Mock hotel list data
    const mockHotelList: HotelListResult[] = [
      {
        chainCode: "HL",
        iataCode: "PAR",
        dupeId: 700006199,
        name: "Hilton Paris Opera",
        hotelId: "HLPAR266",
        geoCode: { latitude: 48.8757, longitude: 2.32553 },
        address: { countryCode: "FR" },
        lastUpdate: "2022-03-01T15:22:17",
      },
      {
        chainCode: "AC",
        iataCode: "PAR",
        dupeId: 700169556,
        name: "ACROPOLIS HOTEL PARIS BOULOGNE",
        hotelId: "ACPARH29",
        geoCode: { latitude: 48.83593, longitude: 2.24922 },
        address: { countryCode: "FR" },
        lastUpdate: "2022-03-01T15:22:17",
      },
      {
        chainCode: "NO",
        iataCode: "PAR",
        dupeId: 700025678,
        name: "Novotel Paris Centre Tour Eiffel",
        hotelId: "NOPAR001",
        geoCode: { latitude: 48.8584, longitude: 2.2945 },
        address: { countryCode: "FR" },
        lastUpdate: "2022-03-01T15:22:17",
      },
    ];

    console.log(
      `✅ Returning ${mockHotelList.length} mock hotels for city ${cityCode}`
    );
    return mockHotelList;
  }

  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams({
      cityCode: cityCode,
    });

    if (chainCodes) queryParams.append("chainCodes", chainCodes);
    if (amenities) queryParams.append("amenities", amenities);
    if (ratings) queryParams.append("ratings", ratings);
    if (hotelSource) queryParams.append("hotelSource", hotelSource);

    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Hotel list by city results:", result);

    return result.data.map((item: any) => ({
      chainCode: item.chainCode,
      iataCode: item.iataCode,
      dupeId: item.dupeId,
      name: item.name,
      hotelId: item.hotelId,
      geoCode: {
        latitude: item.geoCode.latitude,
        longitude: item.geoCode.longitude,
      },
      address: {
        countryCode: item.address?.countryCode || "",
      },
      lastUpdate: item.lastUpdate,
    }));
  } catch (error) {
    console.error("❌ Error searching hotels by city:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "An unexpected error occurred while searching hotels by city"
    );
  }
}

/**
 * Search for hotels by geocode (latitude/longitude) using Amadeus Hotel List by Geocode API
 */
export async function searchHotelsByGeocode(
  params: HotelSearchParams
): Promise<HotelListResult[]> {
  const {
    latitude,
    longitude,
    radius = 5,
    radiusUnit = "KM",
    chainCodes,
    amenities,
    ratings,
    hotelSource,
  } = params;

  console.log("🏨 Searching hotels by geocode:", {
    latitude,
    longitude,
    radius,
    radiusUnit,
  });

  if (!latitude || !longitude) {
    throw new Error("Latitude and longitude are required");
  }

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock hotel list for development."
    );

    // Mock hotel list data near coordinates
    const mockHotelList: HotelListResult[] = [
      {
        chainCode: "HL",
        iataCode: "PAR",
        dupeId: 700006199,
        name: "Hilton Paris Opera",
        hotelId: "HLPAR266",
        geoCode: { latitude: 48.8757, longitude: 2.32553 },
        address: { countryCode: "FR" },
        lastUpdate: "2022-03-01T15:22:17",
      },
      {
        chainCode: "AC",
        iataCode: "PAR",
        dupeId: 700169556,
        name: "ACROPOLIS HOTEL PARIS BOULOGNE",
        hotelId: "ACPARH29",
        geoCode: { latitude: 48.83593, longitude: 2.24922 },
        address: { countryCode: "FR" },
        lastUpdate: "2022-03-01T15:22:17",
      },
      {
        chainCode: "NO",
        iataCode: "PAR",
        dupeId: 700025678,
        name: "Novotel Paris Centre Tour Eiffel",
        hotelId: "NOPAR001",
        geoCode: { latitude: 48.8584, longitude: 2.2945 },
        address: { countryCode: "FR" },
        lastUpdate: "2022-03-01T15:22:17",
      },
    ];

    console.log(
      `✅ Returning ${mockHotelList.length} mock hotels near coordinates`
    );
    return mockHotelList;
  }

  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
      radiusUnit: radiusUnit,
    });

    if (chainCodes) queryParams.append("chainCodes", chainCodes);
    if (amenities) queryParams.append("amenities", amenities);
    if (ratings) queryParams.append("ratings", ratings);
    if (hotelSource) queryParams.append("hotelSource", hotelSource);

    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-geocode?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Hotel list by geocode results:", result);

    return result.data.map((item: any) => ({
      chainCode: item.chainCode,
      iataCode: item.iataCode,
      dupeId: item.dupeId,
      name: item.name,
      hotelId: item.hotelId,
      geoCode: {
        latitude: item.geoCode.latitude,
        longitude: item.geoCode.longitude,
      },
      address: {
        countryCode: item.address?.countryCode || "",
      },
      lastUpdate: item.lastUpdate,
    }));
  } catch (error) {
    console.error("❌ Error searching hotels by geocode:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "An unexpected error occurred while searching hotels by geocode"
    );
  }
}

/**
 * Get hotel offers and pricing using Amadeus Hotel Offers API
 */
export async function getHotelOffers(
  params: HotelSearchParams
): Promise<HotelOffersResult[]> {
  const {
    hotelIds,
    checkInDate,
    checkOutDate,
    adults = 1,
    roomQuantity = 1,
  } = params;

  console.log("🏨 Getting hotel offers for:", {
    hotelIds,
    checkInDate,
    checkOutDate,
  });

  if (!hotelIds || !checkInDate || !checkOutDate) {
    throw new Error(
      "Hotel IDs, check-in date, and check-out date are required"
    );
  }

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock hotel offers for development."
    );

    // Mock hotel offers data
    const mockHotelOffers: HotelOffersResult[] = [
      {
        type: "hotel-offers",
        hotel: {
          type: "hotel",
          hotelId: "HLPAR266",
          chainCode: "HL",
          dupeId: 700006199,
          name: "Hilton Paris Opera",
          cityCode: "PAR",
          latitude: 48.8757,
          longitude: 2.32553,
        },
        available: true,
        offers: [
          {
            id: "HLPAR266_001",
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            room: {
              type: "A07",
              typeEstimated: { category: "SUPERIOR_ROOM" },
              description: {
                text: "Superior Room with city view, free WiFi, air conditioning",
                lang: "EN",
              },
            },
            guests: { adults: adults },
            price: {
              currency: "EUR",
              base: "250.00",
              total: "275.00",
              taxes: [
                {
                  code: "VAT",
                  pricingFrequency: "PER_STAY",
                  pricingMode: "PER_PRODUCT",
                  amount: "25.00",
                  currency: "EUR",
                  included: false,
                },
              ],
            },
          },
          {
            id: "HLPAR266_002",
            checkInDate: checkInDate,
            checkOutDate: checkOutDate,
            room: {
              type: "A08",
              typeEstimated: { category: "DELUXE_ROOM" },
              description: {
                text: "Deluxe Room with Eiffel Tower view, free WiFi, air conditioning, minibar",
                lang: "EN",
              },
            },
            guests: { adults: adults },
            price: {
              currency: "EUR",
              base: "350.00",
              total: "385.00",
              taxes: [
                {
                  code: "VAT",
                  pricingFrequency: "PER_STAY",
                  pricingMode: "PER_PRODUCT",
                  amount: "35.00",
                  currency: "EUR",
                  included: false,
                },
              ],
            },
          },
        ],
      },
    ];

    console.log(`✅ Returning mock hotel offers`);
    return mockHotelOffers;
  }

  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams({
      hotelIds: hotelIds,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      adults: adults.toString(),
      roomQuantity: roomQuantity.toString(),
    });

    const response = await fetch(
      `https://test.api.amadeus.com/v3/shopping/hotel-offers?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Hotel offers results:", result);

    return result.data.map((item: any) => ({
      type: item.type,
      hotel: {
        type: item.hotel.type,
        hotelId: item.hotel.hotelId,
        chainCode: item.hotel.chainCode,
        dupeId: item.hotel.dupeId,
        name: item.hotel.name,
        cityCode: item.hotel.cityCode,
        latitude: item.hotel.latitude,
        longitude: item.hotel.longitude,
      },
      available: item.available,
      offers: item.offers.map((offer: any) => ({
        id: offer.id,
        checkInDate: offer.checkInDate,
        checkOutDate: offer.checkOutDate,
        rateCode: offer.rateCode,
        rateFamilyEstimated: offer.rateFamilyEstimated,
        commission: offer.commission,
        room: {
          type: offer.room.type,
          typeEstimated: offer.room.typeEstimated,
          description: {
            text: offer.room.description.text,
            lang: offer.room.description.lang,
          },
        },
        guests: offer.guests,
        price: {
          currency: offer.price.currency,
          base: offer.price.base,
          total: offer.price.total,
          taxes: offer.price.taxes,
          variations: offer.price.variations,
        },
        policies: offer.policies,
      })),
    }));
  } catch (error) {
    console.error("❌ Error getting hotel offers:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while getting hotel offers");
  }
}

/**
 * Get hotel ratings and sentiment analysis using Amadeus Hotel Sentiment API
 */
export async function getHotelSentiments(
  hotelIds: string[]
): Promise<HotelSentimentResult[]> {
  console.log("🏨 Getting hotel sentiments for:", hotelIds);

  if (!hotelIds || hotelIds.length === 0) {
    throw new Error("Hotel IDs are required");
  }

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock hotel sentiments for development."
    );

    // Mock hotel sentiments data
    const mockSentiments: HotelSentimentResult[] = [
      {
        type: "hotelSentiment",
        numberOfReviews: 1250,
        numberOfRatings: 1340,
        hotelId: hotelIds[0] || "HLPAR266",
        overallRating: 87,
        sentiments: {
          sleepQuality: 89,
          service: 92,
          facilities: 85,
          roomComforts: 88,
          valueForMoney: 86,
          catering: 84,
          location: 95,
          internet: 83,
          pointsOfInterest: 90,
          staff: 91,
        },
      },
    ];

    console.log(`✅ Returning mock hotel sentiments`);
    return mockSentiments;
  }

  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams({
      hotelIds: hotelIds.join(","),
    });

    const response = await fetch(
      `https://test.api.amadeus.com/v2/e-reputation/hotel-sentiments?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Hotel sentiments results:", result);

    return result.data.map((item: any) => ({
      type: item.type,
      numberOfReviews: item.numberOfReviews,
      numberOfRatings: item.numberOfRatings,
      hotelId: item.hotelId,
      overallRating: item.overallRating,
      sentiments: item.sentiments,
    }));
  } catch (error) {
    console.error("❌ Error getting hotel sentiments:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "An unexpected error occurred while getting hotel sentiments"
    );
  }
}

// Holiday Package Functions

/**
 * Search for activities/tours using Amadeus Tours and Activities API
 */
export async function searchActivities(params: {
  latitude?: number;
  longitude?: number;
  radius?: number;
  cityCode?: string;
}): Promise<ActivityResult[]> {
  const { latitude, longitude, radius = 1, cityCode } = params;

  console.log("🎭 Searching activities:", params);

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock activities for development."
    );

    // Mock activities data
    const mockActivities: ActivityResult[] = [
      {
        id: "23642",
        type: "activity",
        self: {
          href: "https://test.api.amadeus.com/v1/shopping/activities/23642",
          methods: ["GET"],
        },
        name: "Skip-the-line tickets to the Prado Museum",
        shortDescription:
          "Book your tickets for the Prado Museum in Madrid, discover masterpieces by Velázquez, Goya, Mantegna, Raphael, Tintoretto and access all temporary exhibitions.",
        geoCode: {
          latitude: "40.414000",
          longitude: "-3.691000",
        },
        rating: "4.500000",
        pictures: [
          "https://images.musement.com/cover/0001/07/prado-museum-tickets_header-6456.jpeg?w=500",
        ],
        bookingLink: "https://b2c.mla.cloud/c/QCejqyor?c=2WxbgL36",
        price: {
          currencyCode: "EUR",
          amount: "16.00",
        },
      },
      {
        id: "34567",
        type: "activity",
        self: {
          href: "https://test.api.amadeus.com/v1/shopping/activities/34567",
          methods: ["GET"],
        },
        name: "Barcelona Gothic Quarter Walking Tour",
        shortDescription:
          "Explore the historic Gothic Quarter with a local guide, visit hidden squares, and learn about Barcelona's medieval history.",
        geoCode: {
          latitude: "41.385000",
          longitude: "2.173000",
        },
        rating: "4.800000",
        pictures: ["https://example.com/gothic-quarter-tour.jpg"],
        bookingLink: "https://example.com/book-gothic-tour",
        price: {
          currencyCode: "EUR",
          amount: "25.00",
        },
      },
      {
        id: "45678",
        type: "activity",
        self: {
          href: "https://test.api.amadeus.com/v1/shopping/activities/45678",
          methods: ["GET"],
        },
        name: "Paris Seine River Cruise",
        shortDescription:
          "Enjoy a romantic cruise along the Seine River, passing by iconic landmarks like the Eiffel Tower, Louvre, and Notre-Dame.",
        geoCode: {
          latitude: "48.856600",
          longitude: "2.352200",
        },
        rating: "4.600000",
        pictures: ["https://example.com/seine-cruise.jpg"],
        bookingLink: "https://example.com/book-seine-cruise",
        price: {
          currencyCode: "EUR",
          amount: "35.00",
        },
      },
    ];

    console.log(`✅ Returning ${mockActivities.length} mock activities`);
    return mockActivities;
  }

  try {
    const token = await getAccessToken();

    let url: string;
    if (latitude && longitude) {
      url = `https://test.api.amadeus.com/v1/shopping/activities?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
    } else if (cityCode) {
      // For city-based search, we'd need to get coordinates first
      // For now, return mock data
      return searchActivities({ latitude: 48.8566, longitude: 2.3522, radius });
    } else {
      throw new Error("Either latitude/longitude or cityCode must be provided");
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Activities search results:", result);

    return result.data.map((item: any) => ({
      id: item.id,
      type: item.type,
      self: item.self,
      name: item.name,
      shortDescription: item.shortDescription,
      geoCode: item.geoCode,
      rating: item.rating,
      pictures: item.pictures,
      bookingLink: item.bookingLink,
      price: item.price,
    }));
  } catch (error) {
    console.error("❌ Error searching activities:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while searching activities");
  }
}

/**
 * Search for points of interest using Amadeus Points of Interest API
 */
export async function searchPointsOfInterest(params: {
  latitude: number;
  longitude: number;
  radius?: number;
}): Promise<PointOfInterestResult[]> {
  const { latitude, longitude, radius = 1 } = params;

  console.log("📍 Searching points of interest:", params);

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock points of interest for development."
    );

    // Mock points of interest data
    const mockPOIs: PointOfInterestResult[] = [
      {
        type: "location",
        subType: "POINT_OF_INTEREST",
        id: "AF57D529B2",
        self: {
          href: "https://test.api.amadeus.com/v1/reference-data/locations/pois/AF57D529B2",
          methods: ["GET"],
        },
        geoCode: {
          latitude: 41.40359,
          longitude: 2.17436,
        },
        name: "La Sagrada Familia",
        category: "SIGHTS",
        rank: 5,
        tags: [
          "church",
          "sightseeing",
          "temple",
          "sights",
          "attraction",
          "historicplace",
          "tourguide",
          "landmark",
          "professionalservices",
          "latte",
          "activities",
          "commercialplace",
        ],
      },
      {
        type: "location",
        subType: "POINT_OF_INTEREST",
        id: "PAR001",
        self: {
          href: "https://test.api.amadeus.com/v1/reference-data/locations/pois/PAR001",
          methods: ["GET"],
        },
        geoCode: {
          latitude: 48.8584,
          longitude: 2.2945,
        },
        name: "Eiffel Tower",
        category: "SIGHTS",
        rank: 10,
        tags: [
          "tower",
          "landmark",
          "paris",
          "iron",
          "attraction",
          "tourism",
          "historic",
        ],
      },
    ];

    console.log(`✅ Returning ${mockPOIs.length} mock points of interest`);
    return mockPOIs;
  }

  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/pois?latitude=${latitude}&longitude=${longitude}&radius=${radius}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Points of interest results:", result);

    return result.data.map((item: any) => ({
      type: item.type,
      subType: item.subType,
      id: item.id,
      self: item.self,
      geoCode: item.geoCode,
      name: item.name,
      category: item.category,
      rank: item.rank,
      tags: item.tags,
    }));
  } catch (error) {
    console.error("❌ Error searching points of interest:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "An unexpected error occurred while searching points of interest"
    );
  }
}

/**
 * Get travel recommendations using Amadeus Travel Recommendations API
 */
export async function getTravelRecommendations(params: {
  cityCodes?: string;
  travelerCountryCode?: string;
  destinationCountryCodes?: string;
}): Promise<TravelRecommendationResult[]> {
  const { cityCodes, travelerCountryCode, destinationCountryCodes } = params;

  console.log("🗺️ Getting travel recommendations:", params);

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock travel recommendations for development."
    );

    // Mock travel recommendations
    const mockRecommendations: TravelRecommendationResult[] = [
      {
        type: "flight-date",
        origin: "NYC",
        destination: "PAR",
        departureDate: "2024-06-15",
        returnDate: "2024-06-22",
        price: {
          total: "650.00",
        },
        links: {
          flightDestinations:
            "https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=NYC&departureDate=2024-06-15&oneWay=false&duration=1,15&nonStop=false",
          flightOffers:
            "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=NYC&destinationLocationCode=PAR&departureDate=2024-06-15&returnDate=2024-06-22&adults=1&nonStop=false",
        },
      },
      {
        type: "flight-date",
        origin: "LAX",
        destination: "BCN",
        departureDate: "2024-07-10",
        returnDate: "2024-07-17",
        price: {
          total: "720.00",
        },
        links: {
          flightDestinations:
            "https://test.api.amadeus.com/v1/shopping/flight-destinations?origin=LAX&departureDate=2024-07-10&oneWay=false&duration=1,15&nonStop=false",
          flightOffers:
            "https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=LAX&destinationLocationCode=BCN&departureDate=2024-07-10&returnDate=2024-07-17&adults=1&nonStop=false",
        },
      },
    ];

    console.log(
      `✅ Returning ${mockRecommendations.length} mock travel recommendations`
    );
    return mockRecommendations;
  }

  try {
    const token = await getAccessToken();

    const queryParams = new URLSearchParams();
    if (cityCodes) queryParams.append("cityCodes", cityCodes);
    if (travelerCountryCode)
      queryParams.append("travelerCountryCode", travelerCountryCode);
    if (destinationCountryCodes)
      queryParams.append("destinationCountryCodes", destinationCountryCodes);

    const response = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/recommended-locations?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error_description || `HTTP error! status: ${response.status}`
      );
    }

    const result = await response.json();
    console.log("✅ Travel recommendations results:", result);

    return result.data.map((item: any) => ({
      type: item.type,
      origin: item.origin,
      destination: item.destination,
      departureDate: item.departureDate,
      returnDate: item.returnDate,
      price: item.price,
      links: item.links,
    }));
  } catch (error) {
    console.error("❌ Error getting travel recommendations:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "An unexpected error occurred while getting travel recommendations"
    );
  }
}

/**
 * Create holiday packages by combining flights, hotels, and activities
 */
export async function searchHolidayPackages(
  params: HolidayPackageSearchParams
): Promise<HolidayPackage[]> {
  const {
    origin,
    destination,
    departureDate,
    returnDate,
    adults,
    budget,
    duration,
  } = params;

  console.log("🎁 Creating holiday packages:", params);

  // Check if API credentials are available
  if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
    console.warn(
      "⚠️ Amadeus API credentials not found. Returning mock holiday packages for development."
    );

    // Comprehensive mock holiday packages database
    const allMockPackages: HolidayPackage[] = [
      // Paris Packages
      {
        id: "PKG-PAR-001",
        destination: {
          name: "Paris, France",
          country: "France",
          cityCode: "PAR",
        },
        flights: {
          outbound: {
            id: "flight-par-1",
            airline: "Air France",
            departureTime: "08:30",
            arrivalTime: "10:45",
            duration: 135,
            stops: 0,
            price: 280,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-par-2",
            airline: "Air France",
            departureTime: "14:20",
            arrivalTime: "16:35",
            duration: 135,
            stops: 0,
            price: 290,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 570,
          currency: "EUR",
        },
        hotel: {
          name: "Hilton Paris Opera",
          rating: 4.5,
          pricePerNight: 180,
          totalPrice: 1260,
          currency: "EUR",
          amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
        },
        activities: [
          {
            id: "23642",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/23642",
              methods: ["GET"],
            },
            name: "Eiffel Tower Visit",
            shortDescription:
              "Skip-the-line tickets to the Eiffel Tower with guided tour",
            geoCode: {
              latitude: "48.858400",
              longitude: "2.294500",
            },
            rating: "4.800000",
            pictures: ["https://example.com/eiffel.jpg"],
            bookingLink: "https://example.com/book-eiffel",
            price: {
              currencyCode: "EUR",
              amount: "45.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 1875,
        currency: "EUR",
        inclusions: [
          "Return flights",
          "7 nights accommodation",
          "Daily breakfast",
          "Airport transfers",
          "City tour",
        ],
        highlights: [
          "Iconic Eiffel Tower experience",
          "Seine River cruise",
          "Louvre Museum visit",
          "Montmartre exploration",
        ],
      },
      {
        id: "PKG-PAR-002",
        destination: {
          name: "Paris, France",
          country: "France",
          cityCode: "PAR",
        },
        flights: {
          outbound: {
            id: "flight-par-3",
            airline: "British Airways",
            departureTime: "10:15",
            arrivalTime: "12:30",
            duration: 135,
            stops: 0,
            price: 320,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-par-4",
            airline: "British Airways",
            departureTime: "16:45",
            arrivalTime: "19:00",
            duration: 135,
            stops: 0,
            price: 340,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 660,
          currency: "EUR",
        },
        hotel: {
          name: "Shangri-La Hotel Paris",
          rating: 5.0,
          pricePerNight: 350,
          totalPrice: 2450,
          currency: "EUR",
          amenities: ["Spa", "Fine dining", "Concierge", "Luxury amenities"],
        },
        activities: [
          {
            id: "45678",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/45678",
              methods: ["GET"],
            },
            name: "Paris Seine River Cruise",
            shortDescription:
              "Enjoy a romantic cruise along the Seine River, passing by iconic landmarks",
            geoCode: {
              latitude: "48.856600",
              longitude: "2.352200",
            },
            rating: "4.600000",
            pictures: ["https://example.com/seine-cruise.jpg"],
            bookingLink: "https://example.com/book-seine-cruise",
            price: {
              currencyCode: "EUR",
              amount: "35.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 3245,
        currency: "EUR",
        inclusions: [
          "Return flights",
          "7 nights luxury accommodation",
          "Daily breakfast",
          "Airport transfers",
          "Seine River cruise",
        ],
        highlights: [
          "Luxury Shangri-La experience",
          "Seine River cruise",
          "Fine dining experiences",
          "Concierge services",
        ],
      },

      // Barcelona Packages
      {
        id: "PKG-BCN-001",
        destination: {
          name: "Barcelona, Spain",
          country: "Spain",
          cityCode: "BCN",
        },
        flights: {
          outbound: {
            id: "flight-bcn-1",
            airline: "Vueling",
            departureTime: "12:15",
            arrivalTime: "14:30",
            duration: 135,
            stops: 0,
            price: 120,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-bcn-2",
            airline: "Vueling",
            departureTime: "18:45",
            arrivalTime: "21:00",
            duration: 135,
            stops: 0,
            price: 130,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 250,
          currency: "EUR",
        },
        hotel: {
          name: "Hotel Arts Barcelona",
          rating: 5.0,
          pricePerNight: 220,
          totalPrice: 1540,
          currency: "EUR",
          amenities: ["Beach access", "Pool", "Spa", "Fine dining"],
        },
        activities: [
          {
            id: "34567",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/34567",
              methods: ["GET"],
            },
            name: "Sagrada Familia Tour",
            shortDescription:
              "Guided tour of Gaudí's masterpiece with skip-the-line access",
            geoCode: {
              latitude: "41.403600",
              longitude: "2.174400",
            },
            rating: "4.900000",
            pictures: ["https://example.com/sagrada.jpg"],
            bookingLink: "https://example.com/book-sagrada",
            price: {
              currencyCode: "EUR",
              amount: "35.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 1825,
        currency: "EUR",
        inclusions: [
          "Return flights",
          "7 nights 5-star hotel",
          "Daily breakfast",
          "Airport transfers",
          "Gaudi architecture tour",
        ],
        highlights: [
          "Sagrada Familia visit",
          "Park Güell exploration",
          "Barcelona Gothic Quarter",
          "Beach relaxation",
          "Catalan cuisine experience",
        ],
      },

      // Dubai Packages
      {
        id: "PKG-DXB-001",
        destination: {
          name: "Dubai, UAE",
          country: "United Arab Emirates",
          cityCode: "DXB",
        },
        flights: {
          outbound: {
            id: "flight-dxb-1",
            airline: "Emirates",
            departureTime: "22:30",
            arrivalTime: "06:45",
            duration: 495,
            stops: 0,
            price: 450,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-dxb-2",
            airline: "Emirates",
            departureTime: "08:20",
            arrivalTime: "12:30",
            duration: 490,
            stops: 0,
            price: 470,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 920,
          currency: "AED",
        },
        hotel: {
          name: "Burj Al Arab",
          rating: 5.0,
          pricePerNight: 800,
          totalPrice: 5600,
          currency: "AED",
          amenities: ["Private beach", "Helipad", "Luxury spa", "Fine dining"],
        },
        activities: [
          {
            id: "78901",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/78901",
              methods: ["GET"],
            },
            name: "Dubai Desert Safari",
            shortDescription:
              "Experience the Arabian desert with dune bashing, camel riding, and traditional dinner",
            geoCode: {
              latitude: "25.204800",
              longitude: "55.270800",
            },
            rating: "4.700000",
            pictures: ["https://example.com/desert-safari.jpg"],
            bookingLink: "https://example.com/book-desert-safari",
            price: {
              currencyCode: "AED",
              amount: "150.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 6670,
        currency: "AED",
        inclusions: [
          "Return flights",
          "7 nights luxury hotel",
          "Daily breakfast",
          "Airport transfers",
          "Desert safari experience",
        ],
        highlights: [
          "Burj Al Arab luxury experience",
          "Dubai Mall shopping",
          "Desert safari adventure",
          "Burj Khalifa visit",
          "Traditional Arabian dinner",
        ],
      },

      // London Packages
      {
        id: "PKG-LHR-001",
        destination: {
          name: "London, UK",
          country: "United Kingdom",
          cityCode: "LHR",
        },
        flights: {
          outbound: {
            id: "flight-lhr-1",
            airline: "British Airways",
            departureTime: "14:30",
            arrivalTime: "18:45",
            duration: 255,
            stops: 0,
            price: 180,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-lhr-2",
            airline: "British Airways",
            departureTime: "10:15",
            arrivalTime: "14:30",
            duration: 255,
            stops: 0,
            price: 190,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 370,
          currency: "GBP",
        },
        hotel: {
          name: "The Ritz London",
          rating: 5.0,
          pricePerNight: 400,
          totalPrice: 2800,
          currency: "GBP",
          amenities: ["Afternoon tea", "Concierge", "Spa", "Fine dining"],
        },
        activities: [
          {
            id: "11223",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/11223",
              methods: ["GET"],
            },
            name: "London Eye Experience",
            shortDescription:
              "Skip-the-line tickets for the iconic London Eye with river views",
            geoCode: {
              latitude: "51.503300",
              longitude: "-0.119500",
            },
            rating: "4.500000",
            pictures: ["https://example.com/london-eye.jpg"],
            bookingLink: "https://example.com/book-london-eye",
            price: {
              currencyCode: "GBP",
              amount: "25.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 3195,
        currency: "GBP",
        inclusions: [
          "Return flights",
          "7 nights luxury hotel",
          "Daily breakfast",
          "Airport transfers",
          "London Eye experience",
        ],
        highlights: [
          "The Ritz luxury experience",
          "London Eye panoramic views",
          "West End theatre shows",
          "Traditional afternoon tea",
          "Thames River cruise",
        ],
      },

      // New York Packages
      {
        id: "PKG-NYC-001",
        destination: {
          name: "New York, USA",
          country: "United States",
          cityCode: "NYC",
        },
        flights: {
          outbound: {
            id: "flight-nyc-1",
            airline: "Delta",
            departureTime: "20:45",
            arrivalTime: "08:30",
            duration: 585,
            stops: 1,
            price: 350,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-nyc-2",
            airline: "Delta",
            departureTime: "16:20",
            arrivalTime: "04:15",
            duration: 595,
            stops: 1,
            price: 370,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 720,
          currency: "USD",
        },
        hotel: {
          name: "The Plaza Hotel",
          rating: 5.0,
          pricePerNight: 500,
          totalPrice: 3500,
          currency: "USD",
          amenities: ["Central Park views", "Spa", "Fine dining", "Concierge"],
        },
        activities: [
          {
            id: "44556",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/44556",
              methods: ["GET"],
            },
            name: "Statue of Liberty Tour",
            shortDescription:
              "Ferry tour to Liberty Island with museum access and Ellis Island",
            geoCode: {
              latitude: "40.689200",
              longitude: "-74.044500",
            },
            rating: "4.600000",
            pictures: ["https://example.com/statue-liberty.jpg"],
            bookingLink: "https://example.com/book-statue-liberty",
            price: {
              currencyCode: "USD",
              amount: "40.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 4260,
        currency: "USD",
        inclusions: [
          "Return flights",
          "7 nights luxury hotel",
          "Daily breakfast",
          "Airport transfers",
          "Statue of Liberty tour",
        ],
        highlights: [
          "The Plaza luxury experience",
          "Central Park views",
          "Broadway show",
          "Statue of Liberty visit",
          "Times Square exploration",
        ],
      },

      // Accra (Ghana) Packages
      {
        id: "PKG-ACC-001",
        destination: {
          name: "Accra, Ghana",
          country: "Ghana",
          cityCode: "ACC",
        },
        flights: {
          outbound: {
            id: "flight-acc-1",
            airline: "Africa World Airlines",
            departureTime: "06:00",
            arrivalTime: "07:30",
            duration: 90,
            stops: 0,
            price: 80,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-acc-2",
            airline: "Africa World Airlines",
            departureTime: "20:30",
            arrivalTime: "22:00",
            duration: 90,
            stops: 0,
            price: 85,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 165,
          currency: "GHS",
        },
        hotel: {
          name: "Labadi Beach Hotel",
          rating: 4.5,
          pricePerNight: 150,
          totalPrice: 1050,
          currency: "GHS",
          amenities: ["Beach access", "Pool", "Restaurant", "Bar"],
        },
        activities: [
          {
            id: "77889",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/77889",
              methods: ["GET"],
            },
            name: "Cape Coast Castle Tour",
            shortDescription:
              "Historical tour of Cape Coast Castle and Elmina Castle with local guide",
            geoCode: {
              latitude: "5.131500",
              longitude: "-1.279400",
            },
            rating: "4.400000",
            pictures: ["https://example.com/cape-coast.jpg"],
            bookingLink: "https://example.com/book-cape-coast",
            price: {
              currencyCode: "GHS",
              amount: "50.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 1265,
        currency: "GHS",
        inclusions: [
          "Return flights",
          "7 nights beach hotel",
          "Daily breakfast",
          "Airport transfers",
          "Historical castle tour",
        ],
        highlights: [
          "Labadi Beach relaxation",
          "Cape Coast Castle history",
          "Local Ghanaian cuisine",
          "Atlantic Ocean views",
          "Cultural experiences",
        ],
      },
      {
        id: "PKG-ACC-002",
        destination: {
          name: "Accra, Ghana",
          country: "Ghana",
          cityCode: "ACC",
        },
        flights: {
          outbound: {
            id: "flight-acc-3",
            airline: "Starbow Airlines",
            departureTime: "08:15",
            arrivalTime: "09:45",
            duration: 90,
            stops: 0,
            price: 95,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-acc-4",
            airline: "Starbow Airlines",
            departureTime: "18:00",
            arrivalTime: "19:30",
            duration: 90,
            stops: 0,
            price: 100,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 195,
          currency: "GHS",
        },
        hotel: {
          name: "Mövenpick Ambassador Hotel Accra",
          rating: 5.0,
          pricePerNight: 200,
          totalPrice: 1400,
          currency: "GHS",
          amenities: ["Spa", "Gym", "Fine dining", "Business center"],
        },
        activities: [
          {
            id: "88990",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/88990",
              methods: ["GET"],
            },
            name: "Accra City Cultural Tour",
            shortDescription:
              "Explore Accra's markets, Independence Square, and local culture",
            geoCode: {
              latitude: "5.603700",
              longitude: "-0.187000",
            },
            rating: "4.300000",
            pictures: ["https://example.com/accra-cultural.jpg"],
            bookingLink: "https://example.com/book-accra-cultural",
            price: {
              currencyCode: "GHS",
              amount: "40.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 1635,
        currency: "GHS",
        inclusions: [
          "Return flights",
          "7 nights 5-star hotel",
          "Daily breakfast",
          "Airport transfers",
          "Cultural city tour",
        ],
        highlights: [
          "Mövenpick luxury experience",
          "Accra cultural exploration",
          "Local markets and cuisine",
          "Independence Square visit",
          "Ghanaian hospitality",
        ],
      },

      // Tokyo Packages
      {
        id: "PKG-NRT-001",
        destination: {
          name: "Tokyo, Japan",
          country: "Japan",
          cityCode: "NRT",
        },
        flights: {
          outbound: {
            id: "flight-nrt-1",
            airline: "Japan Airlines",
            departureTime: "18:30",
            arrivalTime: "14:45",
            duration: 720,
            stops: 1,
            price: 550,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-nrt-2",
            airline: "Japan Airlines",
            departureTime: "16:20",
            arrivalTime: "12:35",
            duration: 735,
            stops: 1,
            price: 570,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 1120,
          currency: "JPY",
        },
        hotel: {
          name: "The Ritz-Carlton Tokyo",
          rating: 5.0,
          pricePerNight: 25000,
          totalPrice: 175000,
          currency: "JPY",
          amenities: ["Spa", "Fine dining", "City views", "Concierge"],
        },
        activities: [
          {
            id: "33445",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/33445",
              methods: ["GET"],
            },
            name: "Tokyo Skytree Tour",
            shortDescription:
              "Visit Tokyo Skytree with observation deck and shopping mall access",
            geoCode: {
              latitude: "35.710000",
              longitude: "139.810700",
            },
            rating: "4.700000",
            pictures: ["https://example.com/tokyo-skytree.jpg"],
            bookingLink: "https://example.com/book-tokyo-skytree",
            price: {
              currencyCode: "JPY",
              amount: "2000.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 178120,
        currency: "JPY",
        inclusions: [
          "Return flights",
          "7 nights luxury hotel",
          "Daily breakfast",
          "Airport transfers",
          "Tokyo Skytree tour",
        ],
        highlights: [
          "Ritz-Carlton luxury experience",
          "Tokyo Skytree panoramic views",
          "Sushi and traditional cuisine",
          "Shibuya Crossing exploration",
          "Japanese culture immersion",
        ],
      },

      // Cape Town Packages
      {
        id: "PKG-CPT-001",
        destination: {
          name: "Cape Town, South Africa",
          country: "South Africa",
          cityCode: "CPT",
        },
        flights: {
          outbound: {
            id: "flight-cpt-1",
            airline: "South African Airways",
            departureTime: "22:00",
            arrivalTime: "06:30",
            duration: 510,
            stops: 1,
            price: 380,
            cabinClass: "Economy",
          } as FlightResult,
          return: {
            id: "flight-cpt-2",
            airline: "South African Airways",
            departureTime: "20:45",
            arrivalTime: "05:15",
            duration: 510,
            stops: 1,
            price: 390,
            cabinClass: "Economy",
          } as FlightResult,
          totalPrice: 770,
          currency: "ZAR",
        },
        hotel: {
          name: "The Table Bay Hotel",
          rating: 5.0,
          pricePerNight: 1200,
          totalPrice: 8400,
          currency: "ZAR",
          amenities: [
            "Table Mountain views",
            "Spa",
            "Fine dining",
            "Harbor views",
          ],
        },
        activities: [
          {
            id: "55667",
            type: "activity",
            self: {
              href: "https://test.api.amadeus.com/v1/shopping/activities/55667",
              methods: ["GET"],
            },
            name: "Table Mountain Cable Car",
            shortDescription:
              "Cable car ride to the top of Table Mountain with guided nature walk",
            geoCode: {
              latitude: "-33.962100",
              longitude: "18.409800",
            },
            rating: "4.800000",
            pictures: ["https://example.com/table-mountain.jpg"],
            bookingLink: "https://example.com/book-table-mountain",
            price: {
              currencyCode: "ZAR",
              amount: "350.00",
            },
          },
        ],
        duration: 7,
        totalPrice: 9520,
        currency: "ZAR",
        inclusions: [
          "Return flights",
          "7 nights luxury hotel",
          "Daily breakfast",
          "Airport transfers",
          "Table Mountain cable car",
        ],
        highlights: [
          "Table Bay luxury waterfront",
          "Table Mountain summit experience",
          "Cape Peninsula tour",
          "Wine tasting in Stellenbosch",
          "Marine wildlife viewing",
        ],
      },
    ];

    // Filter packages based on search criteria
    let filteredPackages = allMockPackages.filter((pkg) => {
      // Filter by destination if specified
      if (destination) {
        const searchTerm = destination.toLowerCase();
        const destinationMatch =
          pkg.destination.name.toLowerCase().includes(searchTerm) ||
          pkg.destination.cityCode.toLowerCase().includes(searchTerm) ||
          pkg.destination.country.toLowerCase().includes(searchTerm);
        if (!destinationMatch) return false;
      }

      // Filter by budget
      if (budget && pkg.totalPrice > budget) return false;

      // Filter by duration
      if (duration && pkg.duration !== duration) return false;

      // Filter by package type (basic price filtering)
      if (packageType) {
        if (packageType === "budget" && pkg.totalPrice > 2000) return false;
        if (
          packageType === "standard" &&
          (pkg.totalPrice < 1000 || pkg.totalPrice > 4000)
        )
          return false;
        if (packageType === "luxury" && pkg.totalPrice < 3000) return false;
      }

      return true;
    });

    // If no packages match the criteria, return some default packages
    if (filteredPackages.length === 0) {
      console.log("No packages match criteria, returning popular destinations");
      filteredPackages = allMockPackages.slice(0, 4); // Return first 4 packages
    }

    // Limit results to 6 packages max
    filteredPackages = filteredPackages.slice(0, 6);

    console.log(
      `✅ Returning ${filteredPackages.length} filtered holiday packages for "${
        destination || "all destinations"
      }"`
    );
    return filteredPackages;
  }

  try {
    // In a real implementation, this would:
    // 1. Get travel recommendations
    // 2. Search for flights to recommended destinations
    // 3. Find hotels at destinations
    // 4. Get activities/points of interest
    // 5. Package everything together

    // For now, return mock data as the full integration is complex
    return searchHolidayPackages(params);
  } catch (error) {
    console.error("❌ Error creating holiday packages:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "An unexpected error occurred while creating holiday packages"
    );
  }
}
