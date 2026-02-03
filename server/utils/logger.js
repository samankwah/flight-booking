// server/utils/logger.js
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Tell winston about our colors
winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'info';
};

// Define format for console (development)
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => {
      const { timestamp, level, message, correlationId, ...meta } = info;
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
      const corrId = correlationId ? `[${correlationId}] ` : '';
      return `${timestamp} ${level}: ${corrId}${message} ${metaStr}`;
    }
  )
);

// Define format for files (production) - JSON for easy parsing
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');

// Define transports
const transports = [];

// Console transport (all environments)
transports.push(
  new winston.transports.Console({
    format: consoleFormat,
  })
);

// File transports (production only)
if (process.env.NODE_ENV === 'production') {
  // Error logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d', // Keep logs for 14 days
      zippedArchive: true,
    })
  );

  // Combined logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    })
  );

  // HTTP logs - daily rotation
  transports.push(
    new DailyRotateFile({
      filename: path.join(logsDir, 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      format: fileFormat,
      maxSize: '20m',
      maxFiles: '7d', // Keep HTTP logs for 7 days
      zippedArchive: true,
    })
  );
} else {
  // Development file logs (non-rotating, for debugging)
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: fileFormat,
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: fileFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log'),
      format: fileFormat,
    }),
  ],
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a child logger with correlation ID
logger.withCorrelationId = (correlationId) => {
  return logger.child({ correlationId });
};

// Helper methods for common logging patterns
logger.logRequest = (req, statusCode, responseTime) => {
  logger.http('HTTP Request', {
    method: req.method,
    url: req.originalUrl,
    statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
  });
};

logger.logError = (error, req = null) => {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
  };

  if (req) {
    errorLog.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      correlationId: req.correlationId,
    };
  }

  logger.error('Application Error', errorLog);
};

logger.logPayment = (action, data) => {
  logger.info(`Payment: ${action}`, {
    action,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

logger.logAuth = (action, userId, data = {}) => {
  logger.info(`Auth: ${action}`, {
    action,
    userId,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

logger.logBooking = (action, bookingId, userId, data = {}) => {
  logger.info(`Booking: ${action}`, {
    action,
    bookingId,
    userId,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

logger.logAdmin = (action, adminId, targetId, data = {}) => {
  logger.info(`Admin: ${action}`, {
    action,
    adminId,
    targetId,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

// Log startup information
logger.info('Logger initialized', {
  level: level(),
  environment: process.env.NODE_ENV || 'development',
  nodeVersion: process.version,
});

export default logger;
