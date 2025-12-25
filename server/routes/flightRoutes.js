import express from "express";
import {
  searchFlights,
  searchAirports,
  searchFlightInspiration,
} from "../controllers/flightController.js";
import { flightSearchLimiter } from "../middleware/rateLimiter.js";
import { validate, validateQuery, sanitizeInput, flightSearchSchema, airportSearchSchema } from "../middleware/validation.js";
import { cacheFlightSearch, cacheAirportSearch, setCacheHeaders } from "../middleware/cache.js";

const router = express.Router();

/**
 * @swagger
 * /flights/search:
 *   post:
 *     summary: Search for flights
 *     description: Search for available flights based on origin, destination, dates, and passenger information
 *     tags: [Flights]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FlightSearchRequest'
 *           example:
 *             origin: "JFK"
 *             destination: "LHR"
 *             departureDate: "2024-12-25"
 *             returnDate: "2024-12-30"
 *             adults: 2
 *             children: 1
 *             travelClass: "ECONOMY"
 *     responses:
 *       200:
 *         description: Flight search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Flight result object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/search", sanitizeInput, validate(flightSearchSchema), flightSearchLimiter, cacheFlightSearch, searchFlights);

/**
 * @swagger
 * /flights/airports:
 *   get:
 *     summary: Search airports
 *     description: Search for airports by keyword
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         description: Airport name, city, or IATA code
 *         example: "London"
 *     responses:
 *       200:
 *         description: Airport search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: Airport identifier
 *                       name:
 *                         type: string
 *                         description: Full airport name
 *                       iataCode:
 *                         type: string
 *                         description: IATA airport code
 *                       cityName:
 *                         type: string
 *                         description: City name
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/airports", validateQuery(airportSearchSchema), flightSearchLimiter, setCacheHeaders(3600), cacheAirportSearch, searchAirports);

/**
 * @swagger
 * /flights/inspiration:
 *   get:
 *     summary: Get flight inspiration destinations
 *     description: Get destination suggestions with prices from a given origin
 *     tags: [Flights]
 *     parameters:
 *       - in: query
 *         name: origin
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 3
 *           maxLength: 3
 *         description: Origin airport IATA code
 *         example: "ACC"
 *     responses:
 *       200:
 *         description: Flight inspiration results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       city:
 *                         type: string
 *                       airport:
 *                         type: string
 *                       price:
 *                         type: number
 *                       departureDate:
 *                         type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.get("/inspiration", flightSearchLimiter, setCacheHeaders(3600), searchFlightInspiration);

export default router;
