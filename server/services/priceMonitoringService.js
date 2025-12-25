// server/services/priceMonitoringService.js
import { db, isFirebaseAvailable } from '../config/firebase.js';
import amadeusService from './amadeusService.js';
import nodemailer from 'nodemailer';

class PriceMonitoringService {
  constructor() {
    this.isFirebaseAvailable = isFirebaseAvailable;
    this.alertsCollection = db.collection('priceAlerts');
    this.isRunning = false;

    // Configure email transporter only if credentials are provided
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      this.transporter = null;
    }
  }

  /**
   * Start the price monitoring service
   */
  async start(interval = 3600000) { // Default: 1 hour
    if (this.isRunning) {
      console.log('⚠️ Price monitoring service is already running');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Price monitoring service started');

    // Run immediately on start
    await this.checkAllAlerts();

    // Then run at intervals
    this.intervalId = setInterval(async () => {
      await this.checkAllAlerts();
    }, interval);
  }

  /**
   * Stop the price monitoring service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.isRunning = false;
      console.log('🛑 Price monitoring service stopped');
    }
  }

  /**
   * Check all active price alerts
   */
  async checkAllAlerts() {
    try {
      if (!this.isFirebaseAvailable) {
        console.log('⏭️  Skipping price alert check - Firebase not configured');
        return;
      }

      console.log('🔍 Checking all active price alerts...');

      const snapshot = await this.alertsCollection
        .where('active', '==', true)
        .get();

      // Handle both real Firebase snapshot and mock snapshot
      const docs = snapshot.docs || [];

      if (docs.length === 0 || snapshot.empty) {
        console.log('📭 No active price alerts to check');
        return;
      }

      console.log(`📊 Found ${docs.length} active alerts to check`);

      const alerts = [];

      // Use docs array directly instead of forEach for compatibility
      for (const doc of docs) {
        alerts.push({
          id: doc.id,
          ...doc.data(),
        });
      }

      // Process alerts based on frequency
      const alertsToCheck = this.filterAlertsByFrequency(alerts);

      console.log(`⏰ ${alertsToCheck.length} alerts are due for checking`);

      // Check each alert
      for (const alert of alertsToCheck) {
        await this.checkAlert(alert);
        // Add delay to avoid rate limiting
        await this.sleep(1000);
      }

      console.log('✅ Price alert check completed');
    } catch (error) {
      console.error('❌ Error checking alerts:', error);
    }
  }

  /**
   * Filter alerts based on their check frequency
   */
  filterAlertsByFrequency(alerts) {
    const now = new Date();

    return alerts.filter(alert => {
      if (!alert.lastChecked) return true;

      const lastChecked = new Date(alert.lastChecked);
      const hoursSinceCheck = (now - lastChecked) / (1000 * 60 * 60);

      switch (alert.frequency) {
        case 'hourly':
          return hoursSinceCheck >= 1;
        case 'daily':
          return hoursSinceCheck >= 24;
        case 'weekly':
          return hoursSinceCheck >= 168; // 7 days
        default:
          return hoursSinceCheck >= 24;
      }
    });
  }

  /**
   * Check a single price alert
   */
  async checkAlert(alert) {
    try {
      console.log(`🔎 Checking alert ${alert.id} for ${alert.route.from} → ${alert.route.to}`);

      // Search for current flight prices
      const searchParams = {
        origin: alert.route.from,
        destination: alert.route.to,
        departureDate: alert.route.departureDate,
        returnDate: alert.route.returnDate || undefined,
        adults: alert.passengers?.adults || 1,
        children: alert.passengers?.children || 0,
        infants: alert.passengers?.infants || 0,
        travelClass: alert.travelClass || 'ECONOMY',
      };

      const flights = await amadeusService.searchFlights(searchParams);

      if (!flights || flights.length === 0) {
        console.log(`⚠️ No flights found for alert ${alert.id}`);
        return;
      }

      // Get the cheapest flight price
      const cheapestFlight = flights.reduce((min, flight) =>
        flight.price < min.price ? flight : min
      );

      const currentPrice = cheapestFlight.price;
      console.log(`💰 Current price: $${currentPrice}, Target: $${alert.targetPrice}`);

      // Update price history
      const priceHistory = alert.priceHistory || [];
      priceHistory.push({
        price: currentPrice,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 30 price points
      if (priceHistory.length > 30) {
        priceHistory.shift();
      }

      // Update alert in database
      await this.alertsCollection.doc(alert.id).update({
        currentPrice,
        priceHistory,
        lastChecked: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Check if price dropped below target
      if (currentPrice <= alert.targetPrice) {
        console.log(`🎉 Price alert triggered! Current: $${currentPrice}, Target: $${alert.targetPrice}`);
        await this.sendPriceAlert(alert, currentPrice, cheapestFlight);

        // Optionally deactivate the alert after triggering
        await this.alertsCollection.doc(alert.id).update({
          active: false,
          triggeredAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error(`❌ Error checking alert ${alert.id}:`, error);
    }
  }

  /**
   * Send price alert notification
   */
  async sendPriceAlert(alert, currentPrice, flight) {
    try {
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .price { font-size: 36px; font-weight: bold; color: #10B981; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✈️ Price Alert Triggered!</h1>
              <p>Great news! The flight price you're watching has dropped!</p>
            </div>
            <div class="content">
              <div class="price">$${currentPrice.toFixed(2)}</div>
              <p>The price has dropped to <strong>$${currentPrice.toFixed(2)}</strong> - below your target of <strong>$${alert.targetPrice.toFixed(2)}</strong>!</p>

              <div class="details">
                <div class="detail-row">
                  <span><strong>Route:</strong></span>
                  <span>${alert.route.from} → ${alert.route.to}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Departure:</strong></span>
                  <span>${alert.route.departureDate}</span>
                </div>
                ${alert.route.returnDate ? `
                <div class="detail-row">
                  <span><strong>Return:</strong></span>
                  <span>${alert.route.returnDate}</span>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span><strong>Class:</strong></span>
                  <span>${alert.travelClass}</span>
                </div>
                <div class="detail-row">
                  <span><strong>Passengers:</strong></span>
                  <span>${alert.passengers?.adults || 1} Adult(s)</span>
                </div>
              </div>

              <p><strong>⚠️ Act fast!</strong> Flight prices can change quickly. Book now to secure this deal.</p>

              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/flights?from=${alert.route.from}&to=${alert.route.to}&departureDate=${alert.route.departureDate}${alert.route.returnDate ? `&returnDate=${alert.route.returnDate}` : ''}&adults=${alert.passengers?.adults || 1}&travelClass=${alert.travelClass}" class="button">
                Book Now
              </a>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: alert.email,
        subject: `✈️ Price Alert: ${alert.route.from} → ${alert.route.to} - $${currentPrice.toFixed(2)}`,
        html: emailHtml,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Price alert email sent to ${alert.email}`);
    } catch (error) {
      console.error('❌ Error sending price alert email:', error);
    }
  }

  /**
   * Utility function to add delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new PriceMonitoringService();
