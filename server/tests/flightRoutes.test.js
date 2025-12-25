import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import flightRoutes from '../routes/flightRoutes.js';
import { flightSearchLimiter } from '../middleware/rateLimiter.js';

// Mock the rate limiter
jest.mock('../middleware/rateLimiter.js', () => ({
  flightSearchLimiter: (req, res, next) => next(),
}));

// Mock the flight controller
jest.mock('../controllers/flightController.js', () => ({
  searchFlights: jest.fn((req, res) => {
    res.json({
      success: true,
      data: [
        {
          id: 'FL001',
          airline: 'Test Airline',
          departureAirport: 'JFK',
          arrivalAirport: 'LHR',
          price: 500,
          currency: 'USD',
        },
      ],
    });
  }),
  searchAirports: jest.fn((req, res) => {
    res.json({
      success: true,
      data: [
        {
          id: 'JFK',
          name: 'John F. Kennedy International Airport',
          city: 'New York',
          country: 'USA',
        },
      ],
    });
  }),
}));

describe('Flight Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/flights', flightRoutes);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/flights/search', () => {
    it('should search flights successfully', async () => {
      const flightSearchData = {
        origin: 'JFK',
        destination: 'LHR',
        departureDate: '2024-12-25',
        adults: 2,
        travelClass: 'ECONOMY',
      };

      const response = await request(app)
        .post('/api/flights/search')
        .send(flightSearchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle flight search errors', async () => {
      const { searchFlights } = await import('../controllers/flightController.js');
      searchFlights.mockImplementationOnce((req, res) => {
        res.status(400).json({
          success: false,
          error: 'Invalid search parameters',
        });
      });

      const response = await request(app)
        .post('/api/flights/search')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/flights/airports', () => {
    it('should search airports successfully', async () => {
      const response = await request(app)
        .get('/api/flights/airports?keyword=London')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require keyword parameter', async () => {
      const response = await request(app)
        .get('/api/flights/airports')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });
});

