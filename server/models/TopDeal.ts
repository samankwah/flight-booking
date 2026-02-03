/**
 * TopDeal Model - Featured deal representation
 */

import { BaseModel } from './BaseModel.js';
import { TopDealSchema } from '../schemas/offer.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface ITopDeal extends IFirestoreDocument {
  title: string;
  description: string;
  category: 'flight' | 'hotel' | 'package' | 'destination';
  price: {
    original: number;
    discounted: number;
    currency: string;
  };
  destination: {
    city: string;
    country: string;
    airportCode?: string;
  };
  validFrom: string;
  validUntil: string;
  imageUrl: string;
  featured: boolean;
  isActive: boolean;
  priority: number;
  clickCount: number;
  conversionCount: number;
  metadata?: Record<string, any>;
  createdBy?: string;
}

export class TopDeal extends BaseModel<ITopDeal> implements ITopDeal {
  title!: string;
  description!: string;
  category!: 'flight' | 'hotel' | 'package' | 'destination';
  price!: { original: number; discounted: number; currency: string };
  destination!: { city: string; country: string; airportCode?: string };
  validFrom!: string;
  validUntil!: string;
  imageUrl!: string;
  featured!: boolean;
  isActive!: boolean;
  priority!: number;
  clickCount!: number;
  conversionCount!: number;
  metadata?: Record<string, any>;
  createdBy?: string;

  constructor(data: ITopDeal) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    TopDealSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      title: this.title,
      description: this.description,
      category: this.category,
      price: this.price,
      destination: this.destination,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      imageUrl: this.imageUrl,
      featured: this.featured,
      isActive: this.isActive,
      priority: this.priority,
      clickCount: this.clickCount,
      conversionCount: this.conversionCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.metadata) data.metadata = this.metadata;
    if (this.createdBy) data.createdBy = this.createdBy;

    return data;
  }

  isValid(): boolean {
    const now = new Date();
    return this.isActive &&
           new Date(this.validFrom) <= now &&
           new Date(this.validUntil) >= now;
  }

  getDiscountPercentage(): number {
    return Math.round(((this.price.original - this.price.discounted) / this.price.original) * 100);
  }

  getSavings(): number {
    return this.price.original - this.price.discounted;
  }

  incrementClick(): TopDeal {
    return this.withUpdates({
      clickCount: this.clickCount + 1,
    } as Partial<ITopDeal>) as TopDeal;
  }

  incrementConversion(): TopDeal {
    return this.withUpdates({
      conversionCount: this.conversionCount + 1,
    } as Partial<ITopDeal>) as TopDeal;
  }

  getConversionRate(): number {
    return this.clickCount > 0 ? (this.conversionCount / this.clickCount) * 100 : 0;
  }

  trackClick(): TopDeal {
    return this.incrementClick();
  }

  trackConversion(): TopDeal {
    return this.incrementConversion();
  }

  toggleFeatured(): TopDeal {
    return this.withUpdates({
      featured: !this.featured,
      updatedAt: new Date().toISOString()
    }) as TopDeal;
  }

  deactivate(): TopDeal {
    return this.withUpdates({
      isActive: false,
      updatedAt: new Date().toISOString()
    }) as TopDeal;
  }

  get analytics() {
    return {
      clicks: this.clickCount,
      conversions: this.conversionCount,
      conversionRate: this.getConversionRate()
    };
  }

  static createNew(data: Omit<ITopDeal, 'id' | 'createdAt' | 'updatedAt' | 'clickCount' | 'conversionCount' | 'featured' | 'isActive' | 'priority'>): TopDeal {
    const now = new Date().toISOString();
    return new TopDeal({
      ...data,
      featured: false,
      isActive: true,
      priority: 0,
      clickCount: 0,
      conversionCount: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
}
