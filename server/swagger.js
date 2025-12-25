// server/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Flight Booking API',
      version: '1.0.0',
      description: 'A comprehensive API for flight booking, payment processing, and user management',
      contact: {
        name: 'Flight Booking Support',
        email: 'support@flightbooking.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.flightbooking.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Detailed error message'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Validation failed'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    description: 'Field that failed validation'
                  },
                  message: {
                    type: 'string',
                    description: 'Validation error message'
                  }
                }
              }
            }
          }
        },
        FlightSearchRequest: {
          type: 'object',
          required: ['origin', 'destination', 'departureDate'],
          properties: {
            origin: {
              type: 'string',
              pattern: '^[A-Z]{3}$',
              description: 'IATA airport code for origin',
              example: 'JFK'
            },
            destination: {
              type: 'string',
              pattern: '^[A-Z]{3}$',
              description: 'IATA airport code for destination',
              example: 'LHR'
            },
            departureDate: {
              type: 'string',
              format: 'date',
              description: 'Departure date in YYYY-MM-DD format',
              example: '2024-12-25'
            },
            returnDate: {
              type: 'string',
              format: 'date',
              description: 'Return date in YYYY-MM-DD format (optional)',
              example: '2024-12-30'
            },
            adults: {
              type: 'integer',
              minimum: 1,
              maximum: 9,
              default: 1,
              description: 'Number of adult passengers'
            },
            children: {
              type: 'integer',
              minimum: 0,
              maximum: 8,
              default: 0,
              description: 'Number of child passengers'
            },
            infants: {
              type: 'integer',
              minimum: 0,
              maximum: 8,
              default: 0,
              description: 'Number of infant passengers'
            },
            travelClass: {
              type: 'string',
              enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'],
              default: 'ECONOMY',
              description: 'Travel class preference'
            }
          }
        },
        PaymentIntentRequest: {
          type: 'object',
          required: ['amount', 'currency', 'bookingId', 'userId'],
          properties: {
            amount: {
              type: 'integer',
              description: 'Payment amount in cents',
              example: 15000,
              minimum: 50
            },
            currency: {
              type: 'string',
              description: 'Currency code (lowercase)',
              example: 'usd',
              default: 'usd'
            },
            bookingId: {
              type: 'string',
              description: 'Unique booking identifier',
              example: 'booking-12345'
            },
            userId: {
              type: 'string',
              description: 'User identifier',
              example: 'user-123'
            },
            description: {
              type: 'string',
              description: 'Payment description',
              example: 'Flight booking payment'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Path to the API routes
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
