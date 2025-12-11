import amadeus from "../config/amadeus.js";

class AmadeusService {
  async searchFlights(searchParams) {
    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate || undefined,
        adults: searchParams.adults || 1,
        travelClass: searchParams.travelClass || "ECONOMY",
        currencyCode: "USD",
        max: 10,
      });

      return response.data;
    } catch (error) {
      throw new Error(
        `Amadeus API Error: ${error.description || error.message}`
      );
    }
  }

  async searchAirports(keyword) {
    try {
      const response = await amadeus.referenceData.locations.get({
        keyword: keyword,
        subType: "AIRPORT,CITY",
      });

      return response.data;
    } catch (error) {
      throw new Error(`Airport Search Error: ${error.message}`);
    }
  }
}

export default new AmadeusService();

// src/services/amadeusService.js
// const API_BASE_URL =
//   process.env.API_URL || "http://localhost:3001/api";

// export const searchFlights = async (params) => {
//   try {
//     console.log("🔍 Searching flights with params:", params);

//     const response = await fetch(`${API_BASE_URL}/flights/search`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         origin: params.originLocationCode,
//         destination: params.destinationLocationCode,
//         departureDate: params.departureDate,
//         returnDate: params.returnDate,
//         adults: params.adults || 1,
//         travelClass: params.travelClass || "ECONOMY",
//       }),
//     });

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.error || `HTTP error! status: ${response.status}`
//       );
//     }

//     const result = await response.json();
//     console.log("✅ Flight search results:", result);

//     return result.data || [];
//   } catch (error) {
//     console.error("❌ Error searching flights:", error);
//     throw error;
//   }
// };

// export const searchAirports = async (keyword) => {
//   try {
//     console.log("🔍 Searching airports for:", keyword);

//     const response = await fetch(
//       `${API_BASE_URL}/flights/airports?keyword=${encodeURIComponent(keyword)}`
//     );

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       throw new Error(
//         errorData.error || `HTTP error! status: ${response.status}`
//       );
//     }

//     const result = await response.json();
//     console.log("✅ Airport search results:", result);

//     return result.data || [];
//   } catch (error) {
//     console.error("❌ Error searching airports:", error);
//     throw error;
//   }
// };

// export default {
//   searchFlights,
//   searchAirports,
// };
