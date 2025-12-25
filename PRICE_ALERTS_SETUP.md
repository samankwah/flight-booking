# Price Alerts & Tracking System - Setup Guide

## Overview

The Price Alerts system allows users to set up notifications for flight price drops. When a flight price falls below the user's target price, they receive an email notification.

## Features

- ✅ Set price alerts for specific flight routes
- ✅ Customizable target prices
- ✅ Flexible monitoring frequency (hourly, daily, weekly)
- ✅ Automatic price checking via cron jobs
- ✅ Email notifications when prices drop
- ✅ Price history tracking
- ✅ Toggle alerts on/off
- ✅ User-specific alert management

## Architecture

### Frontend Components

1. **PriceAlertButton.tsx** (`src/components/`)
   - Button component displayed on flight search results
   - Modal interface for creating price alerts
   - User authentication check
   - Form validation

2. **priceAlertApi.ts** (`src/services/`)
   - API client for price alert operations
   - CRUD operations (Create, Read, Update, Delete)
   - Authentication token management

3. **FlightResults.tsx** (`src/components/`)
   - Integrated with PriceAlertButton
   - Displays button for each flight result

### Backend Components

1. **priceAlertRoutes.js** (`server/routes/`)
   - REST API endpoints for price alerts
   - Authentication middleware
   - Swagger documentation

2. **priceAlertController.js** (`server/controllers/`)
   - Business logic for alert management
   - Firestore database operations
   - User authorization checks

3. **priceMonitoringService.js** (`server/services/`)
   - Background service for price checking
   - Amadeus API integration
   - Email notification system
   - Price history management

4. **priceAlert.js** (`server/models/`)
   - Data model for price alerts
   - Firestore serialization

## Database Schema

### PriceAlert Collection (Firestore)

```javascript
{
  userId: string,           // Firebase user ID
  email: string,            // User email for notifications
  route: {
    from: string,           // Origin airport code (e.g., "JFK")
    to: string,             // Destination airport code (e.g., "LHR")
    departureDate: string,  // ISO date string
    returnDate: string?     // Optional for round trips
  },
  targetPrice: number,      // Price threshold for alerts
  currentPrice: number?,    // Last checked price
  currency: string,         // Default: "USD"
  travelClass: string,      // "ECONOMY", "BUSINESS", "FIRST"
  passengers: {
    adults: number,
    children: number?,
    infants: number?
  },
  frequency: string,        // "hourly", "daily", "weekly"
  active: boolean,          // Alert active status
  createdAt: string,        // ISO timestamp
  updatedAt: string,        // ISO timestamp
  lastChecked: string?,     // Last price check timestamp
  triggeredAt: string?,     // When alert was triggered
  priceHistory: [{          // Last 30 price points
    price: number,
    timestamp: string
  }]
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install nodemailer node-cron
```

### 2. Configure Environment Variables

Add to your `.env` file:

```env
# Email Configuration for Price Alerts
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Frontend URL for email links
FRONTEND_URL=http://localhost:5173
```

### 3. Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/security
   - Navigate to "2-Step Verification"
   - Scroll to "App passwords"
   - Create a password for "Mail" / "Other"
   - Use this password in `EMAIL_PASSWORD`

### 4. Firestore Indexes

Create the following index in Firestore:

```
Collection: priceAlerts
Fields:
  - userId (Ascending)
  - active (Ascending)
  - createdAt (Descending)
```

## API Endpoints

### POST /api/price-alerts
Create a new price alert

**Request Body:**
```json
{
  "route": {
    "from": "JFK",
    "to": "LHR",
    "departureDate": "2025-06-15",
    "returnDate": "2025-06-22"
  },
  "targetPrice": 450,
  "travelClass": "ECONOMY",
  "passengers": {
    "adults": 2
  },
  "frequency": "daily"
}
```

### GET /api/price-alerts
Get all price alerts for authenticated user

**Query Parameters:**
- `active` (boolean): Filter by active status

### GET /api/price-alerts/:id
Get a specific price alert

### PUT /api/price-alerts/:id
Update a price alert

### DELETE /api/price-alerts/:id
Delete a price alert

### PATCH /api/price-alerts/:id/toggle
Toggle alert active status

### POST /api/price-alerts/check-now
Manually trigger price check (for testing)

## Price Monitoring

### Cron Schedule

The price monitoring service runs automatically:
- **Schedule:** Every hour (`0 * * * *`)
- **On Startup:** Runs immediately when server starts

### Monitoring Logic

1. Fetch all active alerts from Firestore
2. Filter alerts based on frequency:
   - Hourly: Check if >= 1 hour since last check
   - Daily: Check if >= 24 hours since last check
   - Weekly: Check if >= 7 days since last check
3. For each alert:
   - Search current flight prices using Amadeus API
   - Find cheapest available flight
   - Update price history (last 30 points)
   - If price <= target price:
     - Send email notification
     - Mark alert as triggered
     - Deactivate alert

### Rate Limiting

- 1 second delay between alert checks
- Prevents Amadeus API rate limiting

## Email Notifications

### Template Features

- Beautiful HTML email design
- Current price highlighted
- Flight route details
- Direct booking link
- Responsive layout

### Email Content

- **Subject:** Price Alert: {ROUTE} - ${PRICE}
- **From:** Configured EMAIL_USER
- **To:** User's registered email

## Testing

### Manual Price Check

```bash
curl -X POST http://localhost:3001/api/price-alerts/check-now
```

### Create Test Alert

```bash
curl -X POST http://localhost:3001/api/price-alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "route": {
      "from": "JFK",
      "to": "LAX",
      "departureDate": "2025-07-01"
    },
    "targetPrice": 200,
    "frequency": "hourly"
  }'
```

## User Flow

1. **User searches for flights** → Sees flight results
2. **Clicks "Set Price Alert"** button on desired flight
3. **Modal opens** with:
   - Current flight price
   - Target price input (default: 10% less)
   - Check frequency dropdown
4. **User submits** → Alert created in database
5. **Background service checks** price at scheduled intervals
6. **When price drops** → Email notification sent
7. **User clicks booking link** → Redirected to flight search with parameters

## Monitoring & Logs

### Server Logs

```
🚀 Backend server running on http://localhost:3001
⏰ Setting up price monitoring cron job...
🏃 Running initial price alert check...
🔍 Checking all active price alerts...
📊 Found 5 active alerts to check
⏰ 3 alerts are due for checking
🔎 Checking alert abc123 for JFK → LHR
💰 Current price: $425, Target: $450
🎉 Price alert triggered! Current: $425, Target: $450
📧 Price alert email sent to user@example.com
✅ Price alert check completed
```

## Troubleshooting

### Email Not Sending

1. Check EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD in .env
2. Verify Gmail App Password is correct
3. Check server logs for email errors
4. Test with manual trigger: POST /api/price-alerts/check-now

### Alerts Not Checking

1. Verify cron job is running (check logs on server start)
2. Check alert frequency and lastChecked timestamp
3. Ensure alerts are active in database
4. Manual trigger to test: POST /api/price-alerts/check-now

### Amadeus API Errors

1. Check Amadeus API credentials
2. Verify API rate limits not exceeded
3. Check flight route validity (airport codes exist)
4. Review server logs for detailed error messages

## Security Considerations

1. **Authentication Required:** All endpoints require valid JWT token
2. **User Authorization:** Users can only access their own alerts
3. **Input Validation:** All inputs validated via middleware
4. **Rate Limiting:** API endpoints protected against abuse
5. **Environment Variables:** Sensitive data stored securely

## Performance Optimization

1. **Batch Processing:** Alerts checked in batches with delays
2. **Price History Limit:** Only stores last 30 price points
3. **Frequency-Based Checking:** Honors user-selected frequency
4. **Firestore Indexes:** Optimized queries with composite indexes

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] Push notifications (web push)
- [ ] Price drop predictions using ML
- [ ] Multi-route alerts
- [ ] Alert sharing between users
- [ ] Price charts and analytics
- [ ] Flexible price drop percentages
- [ ] Mobile app integration

## Support

For issues or questions:
- Check server logs for detailed error messages
- Review Firestore console for data integrity
- Test endpoints using Swagger UI at `/api-docs`
- Monitor cron job execution in server logs

---

**Status:** ✅ Fully Implemented
**Version:** 1.0.0
**Last Updated:** December 2025
