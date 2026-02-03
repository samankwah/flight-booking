/**
 * SpecialOffer Model - Marketing offer representation
 */

import { BaseModel } from './BaseModel.js';
import { SpecialOfferSchema } from '../schemas/offer.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface ISpecialOffer extends IFirestoreDocument {
  title: string;
  description: string;
  type: 'flight' | 'hotel' | 'package' | 'visa' | 'study_abroad';
  discount: {
    type: 'percentage' | 'fixed';
    value: number;
    currency?: string;
  };
  validFrom: string;
  validUntil: string;
  destination?: string;
  restrictions?: string[];
  promoCode?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  imageUrl?: string;
  isActive: boolean;
  priority: number;
  createdBy?: string;
}

export class SpecialOffer extends BaseModel<ISpecialOffer> implements ISpecialOffer {
  title!: string;
  description!: string;
  type!: 'flight' | 'hotel' | 'package' | 'visa' | 'study_abroad';
  discount!: { type: 'percentage' | 'fixed'; value: number; currency?: string };
  validFrom!: string;
  validUntil!: string;
  destination?: string;
  restrictions?: string[];
  promoCode?: string;
  maxRedemptions?: number;
  currentRedemptions!: number;
  imageUrl?: string;
  isActive!: boolean;
  priority!: number;
  createdBy?: string;

  constructor(data: ISpecialOffer) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    SpecialOfferSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      title: this.title,
      description: this.description,
      type: this.type,
      discount: this.discount,
      validFrom: this.validFrom,
      validUntil: this.validUntil,
      currentRedemptions: this.currentRedemptions,
      isActive: this.isActive,
      priority: this.priority,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.destination) data.destination = this.destination;
    if (this.restrictions) data.restrictions = this.restrictions;
    if (this.promoCode) data.promoCode = this.promoCode;
    if (this.maxRedemptions !== undefined) data.maxRedemptions = this.maxRedemptions;
    if (this.imageUrl) data.imageUrl = this.imageUrl;
    if (this.createdBy) data.createdBy = this.createdBy;

    return data;
  }

  isValid(): boolean {
    const now = new Date();
    return this.isActive &&
           new Date(this.validFrom) <= now &&
           new Date(this.validUntil) >= now &&
           (!this.maxRedemptions || this.currentRedemptions < this.maxRedemptions);
  }

  canRedeem(): boolean {
    return this.isValid();
  }

  redeem(): SpecialOffer {
    return this.withUpdates({
      currentRedemptions: this.currentRedemptions + 1,
    } as Partial<ISpecialOffer>) as SpecialOffer;
  }

  deactivate(): SpecialOffer {
    return this.withUpdates({
      isActive: false,
      updatedAt: new Date().toISOString()
    }) as SpecialOffer;
  }

  static createNew(data: Omit<ISpecialOffer, 'id' | 'createdAt' | 'updatedAt' | 'currentRedemptions' | 'isActive' | 'priority'>): SpecialOffer {
    const now = new Date().toISOString();
    return new SpecialOffer({
      ...data,
      currentRedemptions: 0,
      isActive: true,
      priority: 0,
      createdAt: now,
      updatedAt: now,
    });
  }
}
