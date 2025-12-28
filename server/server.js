// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3001;

// app.use(cors());
// app.use(express.json());

// // Simulated Amadeus API endpoint
// app.get('/api/amadeus/flights', async (req, res) => {
//   console.log('Received request for /api/amadeus/flights');
//   console.log('Query parameters:', req.query);

//   const { from, to, departureDate, adults } = req.query;

//   // In a real scenario, you would:
//   // 1. Get Amadeus access token using CLIENT_ID and CLIENT_SECRET
//   // 2. Make an actual API call to Amadeus using fetch/axios
//   // 3. Handle Amadeus API response and errors

//   // For now, let's simulate a response
//   const simulatedFlights = [
//     {
//       id: 'FL9001',
//       airline: { id: '1', name: 'Simulated Air', code: 'SA' },
//       flightNumber: 'SA101',
//       departureAirport: { code: from || 'UNKNOWN', name: 'Unknown From', city: 'Unknown City', country: 'Unknown Country' },
//       arrivalAirport: { code: to || 'UNKNOWN', name: 'Unknown To', city: 'Unknown City', country: 'Unknown Country' },
//       departureTime: '09:00 AM',
//       arrivalTime: '11:30 AM',
//       duration: '2h 30m',
//       stops: 0,
//       price: 150 + Math.floor(Math.random() * 100),
//       currency: 'USD',
//       departureDate: departureDate || '2025-01-01',
//       arrivalDate: departureDate || '2025-01-01',
//       cabinClass: 'economy',
//     },
//     {
//       id: 'FL9002',
//       airline: { id: '2', name: 'Mock Flights', code: 'MF' },
//       flightNumber: 'MF202',
//       departureAirport: { code: from || 'UNKNOWN', name: 'Unknown From', city: 'Unknown City', country: 'Unknown Country' },
//       arrivalAirport: { code: to || 'UNKNOWN', name: 'Unknown To', city: 'Unknown City', country: 'Unknown Country' },
//       departureTime: '01:00 PM',
//       arrivalTime: '05:00 PM',
//       duration: '4h 00m',
//       stops: 1,
//       price: 250 + Math.floor(Math.random() * 150),
//       currency: 'USD',
//       departureDate: departureDate || '2025-01-01',
//       arrivalDate: departureDate || '2025-01-01',
//       cabinClass: 'economy',
//     },
//   ];

//   // Introduce a slight delay to simulate network latency
//   setTimeout(() => {
//     res.json(simulatedFlights);
//   }, 500);
// });

// app.listen(PORT, () => {
//   console.log(`Proxy server listening on port ${PORT}`);
// });

// Load environment variables FIRST before any other imports
import './config/env.js';


import express from "express";
import cors from "cors";
import cron from "node-cron";
import flightRoutes from "./routes/flightRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import priceAlertRoutes from "./routes/priceAlertRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { swaggerUi, specs } from "./swagger.js";
import priceMonitoringService from "./services/priceMonitoringService.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// CORS configuration - restrict to frontend domain
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Apply general rate limiting to all routes
app.use("/api", generalLimiter);

// Swagger documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  })
);

// Routes
app.use("/api/flights", flightRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/price-alerts", priceAlertRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API documentation redirect
app.get("/docs", (req, res) => {
  res.redirect("/api-docs");
});

// Error handler (must be last)
app.use(errorHandler);

// Manual trigger endpoint for price alert checking (for testing)
app.post("/api/price-alerts/check-now", async (req, res) => {
  try {
    await priceMonitoringService.checkAllAlerts();
    res.json({
      success: true,
      message: "Price alerts checked successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to check price alerts",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);

  // Start price monitoring service
  // Run every hour
  console.log("⏰ Setting up price monitoring cron job...");
  cron.schedule('0 * * * *', async () => {
    console.log('🔔 Running scheduled price alert check...');
    await priceMonitoringService.checkAllAlerts();
  });

  // Also run immediately on startup
  console.log("🏃 Running initial price alert check...");
  priceMonitoringService.checkAllAlerts().catch(err => {
    console.error("❌ Error in initial price alert check:", err);
  });
});

