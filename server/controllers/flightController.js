import amadeusService from "../services/amadeusService.js";

export const searchFlights = async (req, res, next) => {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      travelClass,
    } = req.body;

    // Validation
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        error: "Missing required fields: origin, destination, departureDate",
      });
    }

    const flights = await amadeusService.searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      travelClass,
    });

    res.json({
      success: true,
      data: flights,
    });
  } catch (error) {
    next(error);
  }
};

export const searchAirports = async (req, res, next) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    const airports = await amadeusService.searchAirports(keyword);

    res.json({
      success: true,
      data: airports,
    });
  } catch (error) {
    next(error);
  }
};

export const searchFlightInspiration = async (req, res, next) => {
  try {
    const { origin } = req.query;

    if (!origin) {
      return res.status(400).json({ error: "Origin is required" });
    }

    let destinations;
    try {
      destinations = await amadeusService.searchFlightInspiration(origin);
    } catch (amadeusError) {
      // If Amadeus API fails, return fallback popular destinations
      console.warn('⚠️  Amadeus API failed, using fallback destinations:', amadeusError.message);

      destinations = getFallbackDestinations(origin);
    }

    res.json({
      success: true,
      data: destinations,
    });
  } catch (error) {
    next(error);
  }
};

// Fallback destinations when Amadeus API is unavailable
const getFallbackDestinations = (origin) => {
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  const returnDate = new Date(nextMonth);
  returnDate.setDate(nextMonth.getDate() + 7);

  const departureDate = nextMonth.toISOString().split('T')[0];
  const returnDateStr = returnDate.toISOString().split('T')[0];

  // Popular destinations from major African airports
  const popularDestinations = {
    'ACC': [
      { destination: 'LOS', city: 'Lagos', country: 'Nigeria', price: 180 },
      { destination: 'LHR', city: 'London', country: 'United Kingdom', price: 550 },
      { destination: 'JFK', city: 'New York', country: 'United States', price: 750 },
      { destination: 'DXB', city: 'Dubai', country: 'UAE', price: 650 },
      { destination: 'JNB', city: 'Johannesburg', country: 'South Africa', price: 420 },
      { destination: 'NBO', city: 'Nairobi', country: 'Kenya', price: 380 },
      { destination: 'ABJ', city: 'Abidjan', country: 'Ivory Coast', price: 150 },
      { destination: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', price: 450 },
    ],
    'LOS': [
      { destination: 'ACC', city: 'Accra', country: 'Ghana', price: 180 },
      { destination: 'LHR', city: 'London', country: 'United Kingdom', price: 520 },
      { destination: 'JFK', city: 'New York', country: 'United States', price: 780 },
      { destination: 'DXB', city: 'Dubai', country: 'UAE', price: 600 },
      { destination: 'JNB', city: 'Johannesburg', country: 'South Africa', price: 450 },
    ],
    'default': [
      { destination: 'LHR', city: 'London', country: 'United Kingdom', price: 550 },
      { destination: 'CDG', city: 'Paris', country: 'France', price: 520 },
      { destination: 'DXB', city: 'Dubai', country: 'UAE', price: 600 },
      { destination: 'JFK', city: 'New York', country: 'United States', price: 750 },
      { destination: 'SIN', city: 'Singapore', country: 'Singapore', price: 850 },
    ]
  };

  const destinations = popularDestinations[origin] || popularDestinations['default'];

  return destinations.map(dest => ({
    id: dest.destination,
    city: dest.city,
    country: dest.country,
    airport: dest.destination,
    price: dest.price,
    departureDate: departureDate,
    returnDate: returnDateStr,
    origin: origin,
  }));
};

