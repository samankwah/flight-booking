/**
 * OfferService - Service for special offers and top deals
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { SpecialOffer, ISpecialOffer } from '../../models/SpecialOffer.js';
import { TopDeal, ITopDeal } from '../../models/TopDeal.js';

export class SpecialOfferService extends BaseService<ISpecialOffer, SpecialOffer> {
  protected modelClass = SpecialOffer;

  constructor() {
    super('specialOffers');
  }

  /**
   * Get all active special offers
   */
  async getActiveOffers(
    options: {
      limit?: number;
      startAfter?: any;
      type?: string;
    } = {}
  ): Promise<PaginatedResult<SpecialOffer>> {
    const now = new Date().toISOString();

    const queryOptions: QueryOptions = {
      where: [
        { field: 'isActive', operator: '==', value: true },
        { field: 'validUntil', operator: '>=', value: now }
      ],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    };

    if (options.type) {
      queryOptions.where!.push({
        field: 'type',
        operator: '==',
        value: options.type
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get offers by type
   */
  async getOffersByType(
    type: string,
    options: {
      limit?: number;
      activeOnly?: boolean;
    } = {}
  ): Promise<SpecialOffer[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'type', operator: '==', value: type }
      ],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 20
    };

    if (options.activeOnly) {
      const now = new Date().toISOString();
      queryOptions.where!.push(
        { field: 'isActive', operator: '==', value: true },
        { field: 'validUntil', operator: '>=', value: now }
      );
    }

    return this.findAll(queryOptions);
  }

  /**
   * Get offer by code
   */
  async getByCode(code: string): Promise<SpecialOffer | null> {
    return this.findOne({
      where: [
        { field: 'code', operator: '==', value: code }
      ]
    });
  }

  /**
   * Redeem an offer
   */
  async redeemOffer(
    offerId: string,
    userId: string
  ): Promise<SpecialOffer> {
    const offer = await this.findById(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    if (!offer.isValid()) {
      throw new Error('Offer is no longer valid');
    }

    if (!offer.canRedeem()) {
      throw new Error('Offer redemption limit reached');
    }

    const redeemedOffer = offer.redeem(userId);
    return this.update(offerId, redeemedOffer.toFirestore());
  }

  /**
   * Deactivate an offer
   */
  async deactivateOffer(offerId: string): Promise<SpecialOffer> {
    const offer = await this.findById(offerId);
    if (!offer) {
      throw new Error('Offer not found');
    }

    const deactivated = offer.deactivate();
    return this.update(offerId, deactivated.toFirestore());
  }

  /**
   * Get offer statistics (admin)
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    expired: number;
    totalRedemptions: number;
    byType: Record<string, number>;
  }> {
    const offers = await this.findAll();
    const now = new Date().toISOString();

    const byType: Record<string, number> = {};
    let totalRedemptions = 0;

    for (const offer of offers) {
      byType[offer.type] = (byType[offer.type] || 0) + 1;
      totalRedemptions += offer.redemptions?.count || 0;
    }

    return {
      total: offers.length,
      active: offers.filter(o => o.isActive && o.validUntil >= now).length,
      expired: offers.filter(o => o.validUntil < now).length,
      totalRedemptions,
      byType
    };
  }
}

export class TopDealService extends BaseService<ITopDeal, TopDeal> {
  protected modelClass = TopDeal;

  constructor() {
    super('topDeals');
  }

  /**
   * Get all active top deals
   */
  async getActiveDeals(
    options: {
      limit?: number;
      startAfter?: any;
      category?: string;
      featured?: boolean;
    } = {}
  ): Promise<PaginatedResult<TopDeal>> {
    const now = new Date().toISOString();

    const queryOptions: QueryOptions = {
      where: [
        { field: 'isActive', operator: '==', value: true },
        { field: 'validUntil', operator: '>=', value: now }
      ],
      orderBy: [{ field: 'priority', direction: 'asc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    };

    if (options.category) {
      queryOptions.where!.push({
        field: 'category',
        operator: '==',
        value: options.category
      });
    }

    if (options.featured !== undefined) {
      queryOptions.where!.push({
        field: 'featured',
        operator: '==',
        value: options.featured
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get featured deals
   */
  async getFeaturedDeals(
    options: {
      limit?: number;
      category?: string;
    } = {}
  ): Promise<TopDeal[]> {
    const now = new Date().toISOString();

    const queryOptions: QueryOptions = {
      where: [
        { field: 'featured', operator: '==', value: true },
        { field: 'isActive', operator: '==', value: true },
        { field: 'validUntil', operator: '>=', value: now }
      ],
      orderBy: [{ field: 'priority', direction: 'asc' }],
      limit: options.limit || 10
    };

    if (options.category) {
      queryOptions.where!.push({
        field: 'category',
        operator: '==',
        value: options.category
      });
    }

    return this.findAll(queryOptions);
  }

  /**
   * Get deals by category
   */
  async getDealsByCategory(
    category: string,
    options: {
      limit?: number;
      activeOnly?: boolean;
    } = {}
  ): Promise<TopDeal[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'category', operator: '==', value: category }
      ],
      orderBy: [{ field: 'priority', direction: 'asc' }],
      limit: options.limit || 20
    };

    if (options.activeOnly) {
      const now = new Date().toISOString();
      queryOptions.where!.push(
        { field: 'isActive', operator: '==', value: true },
        { field: 'validUntil', operator: '>=', value: now }
      );
    }

    return this.findAll(queryOptions);
  }

  /**
   * Track deal click
   */
  async trackClick(dealId: string): Promise<TopDeal> {
    const deal = await this.findById(dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }

    const updatedDeal = deal.trackClick();
    return this.update(dealId, updatedDeal.toFirestore());
  }

  /**
   * Track deal conversion
   */
  async trackConversion(
    dealId: string,
    bookingId: string,
    revenue: number
  ): Promise<TopDeal> {
    const deal = await this.findById(dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }

    const updatedDeal = deal.trackConversion(bookingId, revenue);
    return this.update(dealId, updatedDeal.toFirestore());
  }

  /**
   * Toggle deal featured status
   */
  async toggleFeatured(dealId: string): Promise<TopDeal> {
    const deal = await this.findById(dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }

    const toggled = deal.toggleFeatured();
    return this.update(dealId, toggled.toFirestore());
  }

  /**
   * Deactivate a deal
   */
  async deactivateDeal(dealId: string): Promise<TopDeal> {
    const deal = await this.findById(dealId);
    if (!deal) {
      throw new Error('Deal not found');
    }

    const deactivated = deal.deactivate();
    return this.update(dealId, deactivated.toFirestore());
  }

  /**
   * Get deal statistics (admin)
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    featured: number;
    expired: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    byCategory: Record<string, number>;
  }> {
    const deals = await this.findAll();
    const now = new Date().toISOString();

    const byCategory: Record<string, number> = {};
    let totalClicks = 0;
    let totalConversions = 0;
    let totalRevenue = 0;

    for (const deal of deals) {
      byCategory[deal.category] = (byCategory[deal.category] || 0) + 1;
      totalClicks += deal.analytics?.clicks || 0;
      totalConversions += deal.analytics?.conversions || 0;
      totalRevenue += deal.analytics?.revenue || 0;
    }

    return {
      total: deals.length,
      active: deals.filter(d => d.isActive && d.validUntil >= now).length,
      featured: deals.filter(d => d.featured).length,
      expired: deals.filter(d => d.validUntil < now).length,
      totalClicks,
      totalConversions,
      totalRevenue,
      byCategory
    };
  }
}

// Export singleton instances
export const specialOfferService = new SpecialOfferService();
export const topDealService = new TopDealService();
