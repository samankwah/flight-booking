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
