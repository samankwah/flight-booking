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

// Booking validation schema
export const bookingSchema = Joi.object({
  flightDetails: Joi.object({
    departureAirport: Joi.string().length(3).pattern(/^[A-Z]{3}$/).required(),
    arrivalAirport: Joi.string().length(3).pattern(/^[A-Z]{3}$/).required(),
    departureTime: Joi.string().max(50).required(),  // Accept any time format (locale strings from frontend)
    arrivalTime: Joi.string().max(50).required(),    // Accept any time format (locale strings from frontend)
    airline: Joi.string().max(100).required(),
    flightNumber: Joi.string().max(20).required(),
    cabinClass: Joi.string().valid('economy', 'business', 'first').required(),
    price: Joi.number().positive().required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
  }).required(),

  passengerInfo: Joi.array().items(
    Joi.object({
      firstName: Joi.string().min(1).max(50).trim().required(),
      lastName: Joi.string().min(1).max(50).trim().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().min(10).max(20).required(),  // Relaxed phone validation (accepts local formats like 0201234567)
      dateOfBirth: Joi.string().optional(),
      passportNumber: Joi.string().max(20).optional(),
    })
  ).min(1).max(9).required(),

  selectedSeats: Joi.array().items(Joi.string().max(10)).max(9).optional(),
  totalPrice: Joi.number().positive().required(),
  paymentIntentId: Joi.string().max(100).optional(),
}).required();

// Visa application validation schema
export const visaApplicationSchema = Joi.object({
  personalInfo: Joi.object({
    firstName: Joi.string().min(1).max(50).trim().required(),
    lastName: Joi.string().min(1).max(50).trim().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    dateOfBirth: Joi.string().isoDate().required(),
    nationality: Joi.string().length(2).uppercase().required(),
    passportNumber: Joi.string().min(5).max(20).required(),
    passportExpiry: Joi.string().isoDate().required(),
  }).required(),

  travelDetails: Joi.object({
    destination: Joi.string().length(2).uppercase().required(),
    purposeOfVisit: Joi.string().valid('tourism', 'business', 'study', 'work', 'other').required(),
    intendedStayDuration: Joi.number().integer().min(1).max(365).required(),
    arrivalDate: Joi.string().isoDate().required(),
    departureDate: Joi.string().isoDate().required(),
  }).required(),

  visaType: Joi.string().max(50).required(),
  status: Joi.string().valid('pending', 'approved', 'rejected', 'processing').default('pending'),
}).required();

// University application validation schema
export const applicationSchema = Joi.object({
  universityId: Joi.string().required(),
  programId: Joi.string().required(),

  personalInfo: Joi.object({
    firstName: Joi.string().min(1).max(50).trim().required(),
    lastName: Joi.string().min(1).max(50).trim().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    dateOfBirth: Joi.string().isoDate().required(),
    nationality: Joi.string().length(2).uppercase().required(),
  }).required(),

  academicInfo: Joi.object({
    highestDegree: Joi.string().max(100).required(),
    institution: Joi.string().max(200).required(),
    graduationYear: Joi.number().integer().min(1950).max(2030).required(),
    gpa: Joi.number().min(0).max(4.0).optional(),
  }).required(),

  status: Joi.string().valid('draft', 'submitted', 'under_review', 'accepted', 'rejected').default('draft'),
}).required();

// Hotel booking validation schema
export const hotelBookingSchema = Joi.object({
  hotelId: Joi.string().required(),
  hotelName: Joi.string().min(1).max(200).required(),

  guestInfo: Joi.object({
    firstName: Joi.string().min(1).max(50).trim().required(),
    lastName: Joi.string().min(1).max(50).trim().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
  }).required(),

  checkInDate: Joi.string().isoDate().required(),
  checkOutDate: Joi.string().isoDate().required(),
  numberOfGuests: Joi.number().integer().min(1).max(10).required(),
  roomType: Joi.string().max(50).required(),
  totalPrice: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  specialRequests: Joi.string().max(500).optional(),
}).required();

// Holiday package booking validation schema
export const holidayBookingSchema = Joi.object({
  packageId: Joi.string().required(),
  packageName: Joi.string().min(1).max(200).required(),

  travelers: Joi.array().items(
    Joi.object({
      firstName: Joi.string().min(1).max(50).trim().required(),
      lastName: Joi.string().min(1).max(50).trim().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
      dateOfBirth: Joi.string().isoDate().optional(),
    })
  ).min(1).max(20).required(),

  startDate: Joi.string().isoDate().required(),
  endDate: Joi.string().isoDate().required(),
  numberOfTravelers: Joi.number().integer().min(1).max(20).required(),
  totalPrice: Joi.number().positive().required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  specialRequests: Joi.string().max(500).optional(),
}).required();

// Notification preferences validation schema
export const notificationPreferencesSchema = Joi.object({
  email: Joi.boolean().default(true),
  push: Joi.boolean().default(true),
  sms: Joi.boolean().default(false),
  priceAlerts: Joi.boolean().default(true),
  bookingUpdates: Joi.boolean().default(true),
  promotions: Joi.boolean().default(false),
}).required();

// Admin user update validation schema
export const adminUserUpdateSchema = Joi.object({
  role: Joi.string().valid('user', 'admin', 'moderator').optional(),
  status: Joi.string().valid('active', 'disabled', 'suspended').optional(),
  emailVerified: Joi.boolean().optional(),
}).min(1); // At least one field must be provided

// Pagination validation schema
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().max(50).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

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
