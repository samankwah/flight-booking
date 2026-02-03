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

// IMPORTANT: Import Sentry instrumentation FIRST (before everything else)
import Sentry from './instrument.js';

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cron from "node-cron";
import flightRoutes from "./routes/flightRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import priceAlertRoutes from "./routes/priceAlertRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import universityRoutes from "./routes/universityRoutes.js";
import visaRoutes from "./routes/visaRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { generalLimiter } from "./middleware/rateLimiter.js";
import { swaggerUi, specs } from "./swagger.js";
import priceMonitoringService from "./services/priceMonitoringService.js";
import logger from "./utils/logger.js";
import { correlationId, morganMiddleware, errorLogger } from "./middleware/requestLogger.js";
import { verifyConnection as verifyEmailConnection } from "./services/gmailEmailService.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Note: Sentry v8+ automatically instruments Express via OpenTelemetry
// No need for Sentry.Handlers.requestHandler() or tracingHandler()

// SECURITY HEADERS - Apply after Sentry, before other middleware
app.use(
  helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for Swagger UI
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
        imgSrc: ["'self'", "data:", "https:"], // Allow images from https and data URIs
        connectSrc: ["'self'"], // API calls to same origin
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Strict-Transport-Security - Force HTTPS
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // X-Frame-Options - Prevent clickjacking
    frameguard: {
      action: 'deny',
    },
    // X-Content-Type-Options - Prevent MIME sniffing
    noSniff: true,
    // X-XSS-Protection - Enable XSS filter
    xssFilter: true,
    // Referrer-Policy - Control referrer information
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    // X-DNS-Prefetch-Control - Control DNS prefetching
    dnsPrefetchControl: {
      allow: false,
    },
    // X-Download-Options - Prevent file downloads in IE
    ieNoOpen: true,
    // X-Permitted-Cross-Domain-Policies - Restrict Adobe products
    permittedCrossDomainPolicies: {
      permittedPolicies: 'none',
    },
  })
);

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key', 'X-API-Key']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Limit body size to prevent DoS
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware - prevents hanging requests
app.use((req, res, next) => {
  // Set 60 second timeout for requests (allows time for Amadeus API calls)
  req.setTimeout(60000);
  res.setTimeout(60000, () => {
    if (!res.headersSent) {
      res.status(408).json({
        success: false,
        error: 'Request Timeout',
        message: 'The request took too long to process. Please try again.'
      });
    }
  });
  next();
});

// Request logging and correlation
app.use(correlationId); // Add correlation ID to all requests
app.use(morganMiddleware); // HTTP request logging

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
app.use("/api/applications", applicationRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/visa-applications", visaRoutes);
app.use("/api/hotel-bookings", hotelRoutes);
app.use("/api/holiday-package-bookings", holidayRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Test PDF generation endpoint (TEMPORARY - Remove after testing)
app.get('/api/test-pdf', async (req, res) => {
  try {
    const { generateFlightTicketPDF } = await import('./services/pdfTicketService.js');

    const mockBooking = {
      id: 'TEST-12345',
      passengerInfo: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890'
      },
      flightDetails: {
        airlineCode: 'BA',
        airline: 'British Airways',
        departureAirport: 'ACC',
        arrivalAirport: 'LHR',
        departureTime: '2025-01-15T10:00:00Z',
        arrivalTime: '2025-01-15T16:30:00Z',
        duration: 390,
        stops: 0,
        cabinClass: 'economy',
        price: 850,
        returnDepartureTime: '2025-01-22T18:00:00Z',
        returnArrivalTime: '2025-01-23T06:30:00Z',
        returnDuration: 450,
        returnStops: 1
      },
      selectedSeats: ['12A'],
      totalPrice: 1700,
      currency: 'USD',
      bookingDate: new Date().toISOString()
    };

    const pdfBuffer = await generateFlightTicketPDF(mockBooking);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=test-ticket.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('PDF generation error', { error: error.message, stack: error.stack });
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// API documentation redirect
app.get("/docs", (req, res) => {
  res.redirect("/api-docs");
});

// Note: Sentry v8+ automatically captures errors via OpenTelemetry
// No need for Sentry.Handlers.errorHandler()

// Error logging middleware (after Sentry, before custom handler)
app.use(errorLogger);

// Custom error handler (must be last)
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

app.listen(PORT, async () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Verify Gmail SMTP connection on startup
  logger.info("Verifying Gmail SMTP connection...");
  try {
    const emailResult = await verifyEmailConnection();
    if (emailResult.success) {
      logger.info("Gmail SMTP verified - email service ready");
    } else if (!emailResult.configured) {
      logger.warn("Gmail SMTP not configured - emails will not be sent");
      logger.warn("To enable emails: set GMAIL_USER and GMAIL_APP_PASSWORD in server/.env");
    } else {
      logger.error("Gmail SMTP verification failed - check credentials");
      logger.error("Generate new App Password at: https://myaccount.google.com/apppasswords");
    }
  } catch (err) {
    logger.error("Error verifying email connection", { error: err.message });
  }

  // Start price monitoring service
  // Run every hour
  logger.info("Setting up price monitoring cron job (hourly)");
  cron.schedule('0 * * * *', async () => {
    logger.info('Running scheduled price alert check');
    try {
      await priceMonitoringService.checkAllAlerts();
      logger.info('Scheduled price alert check completed');
    } catch (err) {
      logger.error('Error in scheduled price alert check', { error: err.message, stack: err.stack });
    }
  });

  // Also run immediately on startup
  logger.info("Running initial price alert check");
  priceMonitoringService.checkAllAlerts().catch(err => {
    logger.error("Error in initial price alert check", { error: err.message, stack: err.stack });
  });
});

