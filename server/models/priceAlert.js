// server/models/priceAlert.js
/**
 * Price Alert Model
 *
 * Represents a price alert set by a user for a specific flight route
 */

export class PriceAlert {
  constructor(data) {
    this.id = data.id || null;
    this.userId = data.userId;
    this.email = data.email;
    this.route = {
      from: data.route.from, // IATA code
      to: data.route.to, // IATA code
      departureDate: data.route.departureDate,
      returnDate: data.route.returnDate || null,
    };
    this.targetPrice = data.targetPrice; // Price user wants to be alerted at
    this.currentPrice = data.currentPrice || null; // Last known price
    this.currency = data.currency || 'USD';
    this.travelClass = data.travelClass || 'ECONOMY';
    this.passengers = {
      adults: data.passengers?.adults || 1,
      children: data.passengers?.children || 0,
      infants: data.passengers?.infants || 0,
    };
    this.frequency = data.frequency || 'daily'; // 'hourly', 'daily', 'weekly'
    this.active = data.active !== undefined ? data.active : true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.lastChecked = data.lastChecked || null;
    this.priceHistory = data.priceHistory || []; // Array of { price, timestamp }
  }

  toFirestore() {
    return {
      userId: this.userId,
      email: this.email,
      route: this.route,
      targetPrice: this.targetPrice,
      currentPrice: this.currentPrice,
      currency: this.currency,
      travelClass: this.travelClass,
      passengers: this.passengers,
      frequency: this.frequency,
      active: this.active,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      lastChecked: this.lastChecked,
      priceHistory: this.priceHistory,
    };
  }

  static fromFirestore(id, data) {
    return new PriceAlert({ id, ...data });
  }
}

export default PriceAlert;
