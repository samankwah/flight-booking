import getAmadeusClient from "../config/amadeus.js";

class AmadeusService {
  async searchFlights(searchParams) {
    try {
      const amadeus = getAmadeusClient();

      // Handle multi-city search
      if (searchParams.segments && Array.isArray(searchParams.segments)) {
        return await this.searchMultiCityFlights(searchParams);
      }

      // Handle one-way and round-trip search
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: searchParams.origin,
        destinationLocationCode: searchParams.destination,
        departureDate: searchParams.departureDate,
        returnDate: searchParams.returnDate || undefined,
        adults: searchParams.adults || 1,
        travelClass: searchParams.travelClass || "ECONOMY",
        currencyCode: searchParams.currency || "USD", // Use requested currency or default to USD
        max: 10,
      });

      // Transform Amadeus response to match our FlightResult interface
      const transformedFlights = response.data.map((offer) => {
        const itinerary = offer.itineraries[0];
        const firstSegment = itinerary.segments[0];
        const lastSegment = itinerary.segments[itinerary.segments.length - 1];

        // Calculate total duration in minutes
        const duration = this.parseDuration(itinerary.duration);

        return {
          id: offer.id,
          airline: firstSegment.carrierCode, // Airline code like "BA", "AA"
          airlineCode: firstSegment.carrierCode,
          departureAirport: firstSegment.departure.iataCode,
          arrivalAirport: lastSegment.arrival.iataCode,
          departureTime: new Date(firstSegment.departure.at).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          ),
          arrivalTime: new Date(lastSegment.arrival.at).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          ),
          duration: duration,
          stops: itinerary.segments.length - 1,
          price: parseFloat(offer.price.total), // Extract numeric price from object
          currency: offer.price.currency, // Extract currency from API response
          cabinClass:
            offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ||
            "ECONOMY",
          alliance:
            firstSegment.operating?.carrierCode || firstSegment.carrierCode,
        };
      });

      return transformedFlights;
    } catch (error) {
      console.error("Amadeus API Error details:", error);
      throw new Error(
        `Amadeus API Error: ${
          error.description || error.message || JSON.stringify(error)
        }`
      );
    }
  }

  async searchAirports(keyword) {
    try {
      const amadeus = getAmadeusClient();
      console.log(
        "🔍 Amadeus API Key:",
        process.env.AMADEUS_API_KEY ? "Set" : "Not Set"
      );
      console.log(
        "🔍 Amadeus API Secret:",
        process.env.AMADEUS_API_SECRET ? "Set" : "Not Set"
      );
      console.log("🔍 Amadeus Hostname:", process.env.AMADEUS_HOSTNAME);
      console.log("🔍 Searching for keyword:", keyword);

      const response = await amadeus.referenceData.locations.get({
        keyword: keyword,
        subType: "AIRPORT,CITY",
      });

      console.log("✅ Amadeus API response received");
      return response.data;
    } catch (error) {
      console.error("❌ Amadeus API Error details:", error);
      console.error("❌ Error code:", error.code);
      console.error("❌ Error description:", error.description);
      console.error("❌ Error response:", error.response?.data);
      throw new Error(
        `Airport Search Error: ${
          error.description || error.message || "Unknown error"
        }`
      );
    }
  }

  // Helper to parse ISO 8601 duration (e.g., "PT2H30M") to minutes
  parseDuration(isoDuration) {
    if (!isoDuration) return 0;
    const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    const hours = parseInt(matches[1] || 0);
    const minutes = parseInt(matches[2] || 0);
    return hours * 60 + minutes;
  }

  async searchMultiCityFlights(searchParams) {
    try {
      const amadeus = getAmadeusClient();

      // Build origin-destination pairs for multi-city search
      const originDestinations = searchParams.segments.map((segment) => ({
        id: segment.id || String(Math.random()),
        originLocationCode: segment.from.code,
        destinationLocationCode: segment.to.code,
        departureDateTimeRange: {
          date: segment.departureDate,
        },
      }));

      // Prepare travelers array
      const travelers = [];
      const adults = searchParams.adults || 1;

      for (let i = 1; i <= adults; i++) {
        travelers.push({
          id: String(i),
          travelerType: "ADULT",
        });
      }

      // Build request body for multi-city search
      const requestBody = {
        originDestinations,
        travelers,
        sources: ["GDS"],
        searchCriteria: {
          maxFlightOffers: 10,
          flightFilters: {
            cabinRestrictions: [
              {
                cabin: searchParams.travelClass || "ECONOMY",
                coverage: "MOST_SEGMENTS",
                originDestinationIds: originDestinations.map((od) => od.id),
              },
            ],
          },
        },
      };

      console.log(
        "🛫 Multi-city search request:",
        JSON.stringify(requestBody, null, 2)
      );

      // Use POST endpoint for multi-city searches
      const response = await amadeus.shopping.flightOffersSearch.post(
        JSON.stringify(requestBody)
      );

      // Transform multi-city results
      const transformedFlights = response.data.map((offer) => {
        // For multi-city, we'll use all itineraries
        const allSegments = offer.itineraries.flatMap((it) => it.segments);
        const firstSegment = allSegments[0];
        const lastSegment = allSegments[allSegments.length - 1];

        // Calculate total duration across all itineraries
        const totalDuration = offer.itineraries.reduce((sum, itinerary) => {
          return sum + this.parseDuration(itinerary.duration);
        }, 0);

        return {
          id: offer.id,
          airline: firstSegment.carrierCode,
          airlineCode: firstSegment.carrierCode,
          departureAirport: firstSegment.departure.iataCode,
          arrivalAirport: lastSegment.arrival.iataCode,
          departureTime: new Date(firstSegment.departure.at).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          ),
          arrivalTime: new Date(lastSegment.arrival.at).toLocaleTimeString(
            "en-US",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }
          ),
          duration: totalDuration,
          stops: allSegments.length - 1,
          price: parseFloat(offer.price.total),
          currency: offer.price.currency, // Extract currency from API response
          cabinClass:
            offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin ||
            "ECONOMY",
          alliance:
            firstSegment.operating?.carrierCode || firstSegment.carrierCode,
          itineraries: offer.itineraries, // Include all itineraries for multi-city display
          isMultiCity: true,
        };
      });

      return transformedFlights;
    } catch (error) {
      console.error("Multi-city Amadeus API Error:", error);
      throw new Error(
        `Multi-city Search Error: ${
          error.description || error.message || JSON.stringify(error)
        }`
      );
    }
  }

  async searchFlightInspiration(origin) {
    try {
      const amadeus = getAmadeusClient();

      console.log(`🌍 Searching flight inspiration from ${origin}`);

      const response = await amadeus.shopping.flightDestinations.get({
        origin: origin,
      });

      console.log(`✅ Found ${response.data.length} destinations`);

      // Transform Amadeus flight inspiration response
      const transformedDestinations = response.data.map((destination) => {
        return {
          id: destination.destination,
          city: destination.destination, // IATA code
          country: destination.destination, // Will need to enrich this
          airport: destination.destination,
          price: parseFloat(destination.price?.total || 0),
          currency: destination.price?.currency || 'USD', // Extract currency from API response
          departureDate: destination.departureDate,
          returnDate: destination.returnDate,
          origin: origin,
        };
      });

      return transformedDestinations;
    } catch (error) {
      console.error("Flight Inspiration API Error:", error);

      // Handle array description from Amadeus errors
      let errorMessage = "Flight Inspiration API Error";
      if (Array.isArray(error.description) && error.description.length > 0) {
        errorMessage =
          error.description[0].detail ||
          error.description[0].title ||
          errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
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
