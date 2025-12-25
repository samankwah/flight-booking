// server/middleware/validation.js
import Joi from 'joi';

/**
 * Validation schemas for different API endpoints
 */

// Flight search validation schema
export const flightSearchSchema = Joi.object({
  origin: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      'string.length': 'Origin airport code must be exactly 3 characters',
      'string.pattern.base': 'Origin must be a valid IATA airport code (3 uppercase letters)',
      'any.required': 'Origin airport is required'
    }),

  destination: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .required()
    .messages({
      'string.length': 'Destination airport code must be exactly 3 characters',
      'string.pattern.base': 'Destination must be a valid IATA airport code (3 uppercase letters)',
      'any.required': 'Destination airport is required'
    }),

  departureDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Departure date must be in YYYY-MM-DD format',
      'any.required': 'Departure date is required'
    }),

  returnDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Return date must be in YYYY-MM-DD format'
    }),

  adults: Joi.number()
    .integer()
    .min(1)
    .max(9)
    .default(1)
    .messages({
      'number.min': 'Number of adults must be at least 1',
      'number.max': 'Number of adults cannot exceed 9'
    }),

  children: Joi.number()
    .integer()
    .min(0)
    .max(8)
    .default(0)
    .messages({
      'number.min': 'Number of children cannot be negative',
      'number.max': 'Number of children cannot exceed 8'
    }),

  infants: Joi.number()
    .integer()
    .min(0)
    .max(8)
    .default(0)
    .messages({
      'number.min': 'Number of infants cannot be negative',
      'number.max': 'Number of infants cannot exceed 8'
    }),

  travelClass: Joi.string()
    .valid('ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST')
    .default('ECONOMY')
    .messages({
      'any.only': 'Travel class must be one of: ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST'
    })
});

// Airport search validation schema
export const airportSearchSchema = Joi.object({
  keyword: Joi.string()
    .min(2)
    .max(50)
    .trim()
    .required()
    .messages({
      'string.min': 'Search keyword must be at least 2 characters',
      'string.max': 'Search keyword cannot exceed 50 characters',
      'any.required': 'Search keyword is required'
    })
});

// Payment intent creation validation schema
export const paymentIntentSchema = Joi.object({
  amount: Joi.number()
    .integer()
    .positive()
    .max(99999999) // Max ~$1M in cents
    .required()
    .messages({
      'number.positive': 'Amount must be positive',
      'number.max': 'Amount exceeds maximum allowed value',
      'any.required': 'Amount is required'
    }),

  currency: Joi.string()
    .length(3)
    .pattern(/^[a-z]{3}$/)
    .default('usd')
    .messages({
      'string.length': 'Currency code must be exactly 3 characters',
      'string.pattern.base': 'Currency must be a valid ISO 4217 code (3 lowercase letters)'
    }),

  bookingId: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Booking ID cannot be empty',
      'string.max': 'Booking ID cannot exceed 100 characters',
      'any.required': 'Booking ID is required'
    }),

  userId: Joi.string()
    .min(1)
    .max(128)
    .required()
    .messages({
      'string.min': 'User ID cannot be empty',
      'string.max': 'User ID cannot exceed 128 characters',
      'any.required': 'User ID is required'
    }),

  description: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),

  metadata: Joi.object()
    .optional()
    .max(20)
    .messages({
      'object.max': 'Too many metadata fields'
    })
});

// Price Alert validation schema
export const priceAlertSchema = Joi.object({
  route: Joi.object({
    from: Joi.string()
      .length(3)
      .pattern(/^[A-Z]{3}$/)
      .required()
      .messages({
        'string.length': 'Origin airport code must be exactly 3 characters',
        'string.pattern.base': 'Origin must be a valid IATA airport code',
        'any.required': 'Origin is required'
      }),
    to: Joi.string()
      .length(3)
      .pattern(/^[A-Z]{3}$/)
      .required()
      .messages({
        'string.length': 'Destination airport code must be exactly 3 characters',
        'string.pattern.base': 'Destination must be a valid IATA airport code',
        'any.required': 'Destination is required'
      }),
    departureDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.pattern.base': 'Departure date must be in YYYY-MM-DD format',
        'any.required': 'Departure date is required'
      }),
    returnDate: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .allow(null)
      .messages({
        'string.pattern.base': 'Return date must be in YYYY-MM-DD format'
      })
  }).required(),

  targetPrice: Joi.number()
    .positive()
    .required()
    .messages({
      'number.positive': 'Target price must be positive',
      'any.required': 'Target price is required'
    }),

  currentPrice: Joi.number()
    .positive()
    .optional()
    .messages({
      'number.positive': 'Current price must be positive'
    }),

  currency: Joi.string()
    .length(3)
    .pattern(/^[A-Z]{3}$/)
    .default('USD')
    .messages({
      'string.length': 'Currency code must be exactly 3 characters',
      'string.pattern.base': 'Currency must be a valid ISO 4217 code'
    }),

  travelClass: Joi.string()
    .valid('ECONOMY', 'BUSINESS', 'FIRST')
    .default('ECONOMY')
    .messages({
      'any.only': 'Travel class must be ECONOMY, BUSINESS, or FIRST'
    }),

  passengers: Joi.object({
    adults: Joi.number().integer().min(1).max(9).default(1),
    children: Joi.number().integer().min(0).max(9).default(0),
    infants: Joi.number().integer().min(0).max(9).default(0)
  }).default({ adults: 1, children: 0, infants: 0 }),

  frequency: Joi.string()
    .valid('hourly', 'daily', 'weekly')
    .default('daily')
    .messages({
      'any.only': 'Frequency must be hourly, daily, or weekly'
    }),

  active: Joi.boolean()
    .default(true)
});

/**
 * Validation middleware factory
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all validation errors
      stripUnknown: true, // Remove unknown fields
      convert: true // Convert types where possible
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    // Replace req.body with validated and sanitized data
    req.body = value;
    next();
  };
};

/**
 * Query parameter validation middleware
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Query validation failed',
        details: errors
      });
    }

    // Replace req.query with validated data
    req.query = value;
    next();
  };
};

/**
 * Sanitization middleware for general input cleaning
 */
export const sanitizeInput = (req, res, next) => {
  // Recursively sanitize strings in the request body
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      // Remove potential XSS vectors and trim whitespace
      return value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    } else if (Array.isArray(value)) {
      return value.map(sanitizeValue);
    } else if (value && typeof value === 'object') {
      const sanitized = {};
      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = sanitizeValue(val);
      }
      return sanitized;
    }
    return value;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }

  next();
};
