# Sentry Error Tracking Setup Guide

This guide explains how to set up Sentry error tracking for the Flight Booking backend.

## What is Sentry?

Sentry is a real-time error tracking and monitoring platform that helps you:
- **Track errors in production** - Get notified immediately when errors occur
- **Debug faster** - See full stack traces, request data, and user context
- **Monitor performance** - Track slow endpoints and database queries
- **Triage issues** - Automatically group similar errors and prioritize by impact

## Current Status

✅ **Sentry is already configured and ready to use!**

The application uses `instrument.js` for Sentry initialization, following official Sentry best practices.

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [https://sentry.io/signup/](https://sentry.io/signup/)
2. Sign up for a free account (free tier includes 5,000 errors/month)
3. Create a new organization (or use existing)

### 2. Create a Project

1. Click **"Create Project"**
2. Select **"Node.js"** as the platform
3. Set alert frequency (recommended: **"Alert me on every new issue"**)
4. Name your project: **"flight-booking-backend"**
5. Click **"Create Project"**

### 3. Get Your DSN

After creating the project, you'll see your **DSN (Data Source Name)**:

```
https://[key]@[organization].ingest.sentry.io/[project-id]
```

**Example:**
```
https://1d96847d8fdd378b277e98e75c2b7f5b@o4510640589045760.ingest.us.sentry.io/4510640600514560
```

### 4. Implementation Details

The application follows Sentry's official pattern with `instrument.js`:

**File: `server/instrument.js`**
- Imported at the **very top** of `server.js` (before all other imports)
- Initializes Sentry before any other code runs
- Configured with Express, HTTP, and Profiling integrations
- Smart error filtering (4xx errors excluded, development suppressed)

### 4. Configure Environment Variables

Add the DSN to your `.env` file:

```bash
# Sentry Error Tracking
SENTRY_DSN=https://your-key@your-org.ingest.sentry.io/your-project-id

# Optional: Enable Sentry in development (for testing)
# SENTRY_DEBUG=true
```

**Important:**
- In **development**, Sentry is **disabled by default** unless `SENTRY_DEBUG=true`
- In **production**, Sentry is **always enabled** if DSN is configured
- Leave `SENTRY_DSN` empty to disable Sentry completely

### 5. Deploy to Production

When deploying to Railway/Render/Vercel:

1. Go to your project's environment variables settings
2. Add `SENTRY_DSN` with your production DSN
3. Redeploy your application

## Features Enabled

### ✅ Automatic Error Tracking

All unhandled errors are automatically captured with:
- Full stack traces
- Request URL, method, headers
- User information (if authenticated)
- Server environment details
- Correlation ID for log tracing

### ✅ Performance Monitoring

Tracks performance of:
- HTTP requests (10% sample rate in production)
- Database queries
- External API calls
- Custom transactions

### ✅ User Context

When users are authenticated, Sentry captures:
- User ID (Firebase UID)
- Email address
- User role (admin, user, etc.)

This helps you identify which users are affected by errors.

### ✅ Request Context

Every error includes:
- HTTP method and URL
- Request headers
- Query parameters
- Request body (sanitized to remove sensitive data)
- Client IP address
- User agent

### ✅ Breadcrumbs

Sentry automatically logs:
- HTTP requests leading up to the error
- Database queries
- Console logs
- Navigation events

This helps you understand what happened before the error occurred.

## Testing Sentry

### Test Error Tracking

Add a test endpoint to trigger an error:

```javascript
app.get('/api/test-sentry-error', (req, res) => {
  throw new Error('Test Sentry Error - This is a test!');
});
```

Visit `http://localhost:3001/api/test-sentry-error` and check Sentry dashboard.

### Test User Context

1. Authenticate a user
2. Trigger an error on an authenticated endpoint
3. Check Sentry dashboard - you should see user information

### Test Performance Monitoring

1. Make several API requests
2. Go to **Performance** tab in Sentry dashboard
3. You'll see transaction traces showing slow endpoints

## Sentry Dashboard

### Issues Tab

- **All Issues**: See all errors grouped by type
- **Filters**: Filter by environment, release, user, etc.
- **Search**: Search error messages and stack traces

### Performance Tab

- **Transactions**: See all HTTP requests
- **Slow Requests**: Identify performance bottlenecks
- **Database Queries**: Find slow database operations

### Releases Tab

- Track errors by release version
- See when errors were introduced
- Monitor error trends over time

## Alert Configuration

### Recommended Alerts

1. **New Issues**
   - Alert: On every new issue
   - Action: Email notification
   - Use case: Catch new bugs immediately

2. **High Error Rate**
   - Alert: When error rate exceeds 100 errors/hour
   - Action: Slack/Email notification
   - Use case: Detect production incidents

3. **Performance Degradation**
   - Alert: When p95 response time > 2 seconds
   - Action: Slack notification
   - Use case: Detect slow endpoints

### Set up Alerts

1. Go to **Alerts** → **Create Alert**
2. Choose **Issues** or **Metric Alert**
3. Configure conditions and actions
4. Save alert rule

## Integration with Logging

Sentry works alongside Winston logging:

- **Winston**: Captures all logs to files (development + production)
- **Sentry**: Captures errors to dashboard (production only by default)
- **Both**: Use correlation IDs to trace requests across systems

When an error occurs:
1. Sentry captures the error and creates an issue
2. Winston logs the error to files with stack trace
3. Both include the correlation ID for cross-referencing

## Best Practices

### ✅ Do's

- **Enable Sentry in production** - Critical for monitoring
- **Set up alerts** - Get notified of new errors immediately
- **Review weekly** - Check dashboard for patterns and trends
- **Use releases** - Tag deployments to track when bugs were introduced
- **Set user context** - Always identify authenticated users

### ❌ Don'ts

- **Don't send sensitive data** - Sentry scrubs passwords, but review
- **Don't ignore 4xx errors** - These are already filtered out
- **Don't overwhelm yourself** - Start with critical alerts only
- **Don't forget to test** - Test Sentry in staging before production

## Troubleshooting

### Sentry not capturing errors

**Check:**
1. Is `SENTRY_DSN` set in environment variables?
2. Is `NODE_ENV=production` (or `SENTRY_DEBUG=true` in development)?
3. Are you testing with 5xx errors (4xx are filtered out)?
4. Check Winston logs for Sentry initialization message

### Errors not showing user info

**Check:**
1. Is user authenticated when error occurs?
2. Is `requireAuth` middleware running before the error?
3. Check if `setSentryUser()` is being called

### Too many errors in Sentry

**Solution:**
1. Add filters in `sentry.js` `beforeSend()` function
2. Adjust sample rate in `tracesSampleRate`
3. Set up alert thresholds to reduce noise

## Cost Management

### Free Tier Limits

- **5,000 errors/month**
- **10,000 performance events/month**
- **1 GB attachments/month**
- **30-day event retention**

### Staying Within Free Tier

1. **Filter common errors** - Don't send 404s, rate limit errors, etc.
2. **Reduce sample rate** - Use 10% for performance monitoring
3. **Set up quotas** - Limit errors per project
4. **Use environments** - Only enable in production

### Upgrade if Needed

If you exceed free tier:
- **Team Plan**: $26/month for 50,000 errors
- **Business Plan**: $80/month for 500,000 errors
- **Enterprise**: Custom pricing

## Additional Resources

- [Sentry Node.js Documentation](https://docs.sentry.io/platforms/node/)
- [Sentry Express Integration](https://docs.sentry.io/platforms/node/guides/express/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)
- [Sentry Performance Monitoring](https://docs.sentry.io/product/performance/)

## Support

If you need help:
- [Sentry Community Forum](https://forum.sentry.io/)
- [Sentry Discord](https://discord.gg/sentry)
- [Sentry Support](https://sentry.io/support/)
