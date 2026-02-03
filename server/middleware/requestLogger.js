// server/middleware/requestLogger.js
import morgan from 'morgan';
import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';

/**
 * Middleware to add correlation ID to each request
 * This helps trace requests through logs
 */
export const correlationId = (req, res, next) => {
  // Use existing correlation ID from header, or generate new one
  req.correlationId = req.get('X-Correlation-ID') || randomUUID();

  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', req.correlationId);

  // Attach correlation-aware logger to request
  req.logger = logger.withCorrelationId(req.correlationId);

  next();
};

/**
 * Morgan stream configuration to pipe into Winston
 */
const stream = {
  write: (message) => {
    // Morgan adds a newline at the end, remove it
    logger.http(message.trim());
  },
};

/**
 * Morgan middleware configuration
 * Format: :method :url :status :response-time ms - :res[content-length]
 */
export const morganMiddleware = morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  {
    stream,
    skip: (req, res) => {
      // Skip logging health check endpoints in production
      if (process.env.NODE_ENV === 'production') {
        return req.url === '/health' || req.url === '/api/health';
      }
      return false;
    },
  }
);

/**
 * Enhanced request logging middleware
 * Logs request details and response time
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request start
  req.logger.debug('Request received', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const responseTime = Date.now() - startTime;

    // Log response
    logger.logRequest(req, res.statusCode, responseTime);

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Error logging middleware
 * Should be placed after all routes
 */
export const errorLogger = (err, req, res, next) => {
  // Log the error with request context
  logger.logError(err, req);

  // Pass to next error handler
  next(err);
};
