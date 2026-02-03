/**
 * PriceAlert Model - Price monitoring alert representation
 */

import { BaseModel } from './BaseModel.js';
import { PriceAlertSchema, Route, Passengers, PriceHistory } from '../schemas/priceAlert.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface IPriceAlert extends IFirestoreDocument {
  userId: string;
  email: string;
  route: Route;
  targetPrice: number;
  currentPrice?: number;
  currency: string;
  travelClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  passengers?: Passengers;
  frequency: 'immediate' | 'daily' | 'weekly';
  active: boolean;
  priceHistory?: PriceHistory[];
  lastChecked?: string;
  lastTriggeredAt?: string;
  triggeredCount: number;
}

export class PriceAlert extends BaseModel<IPriceAlert> implements IPriceAlert {
  userId!: string;
  email!: string;
  route!: Route;
  targetPrice!: number;
  currentPrice?: number;
  currency!: string;
  travelClass?: 'economy' | 'premium_economy' | 'business' | 'first';
  passengers?: Passengers;
  frequency!: 'immediate' | 'daily' | 'weekly';
  active!: boolean;
  priceHistory?: PriceHistory[];
  lastChecked?: string;
  lastTriggeredAt?: string;
  triggeredCount!: number;

  constructor(data: IPriceAlert) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    PriceAlertSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      email: this.email,
      route: this.route,
      targetPrice: this.targetPrice,
      currency: this.currency,
      frequency: this.frequency,
      active: this.active,
      triggeredCount: this.triggeredCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.currentPrice !== undefined) data.currentPrice = this.currentPrice;
    if (this.travelClass) data.travelClass = this.travelClass;
    if (this.passengers) data.passengers = this.passengers;
    if (this.priceHistory) data.priceHistory = this.priceHistory;
    if (this.lastChecked) data.lastChecked = this.lastChecked;

    return data;
  }

  isActive(): boolean {
    return this.active;
  }

  shouldTrigger(): boolean {
    return this.active && this.currentPrice !== undefined && this.currentPrice <= this.targetPrice;
  }

  getRouteString(): string {
    return `${this.route.from} → ${this.route.to}`;
  }

  addPriceHistory(price: number, triggered: boolean = false): PriceAlert {
    const newHistory: PriceHistory = {
      price,
      timestamp: new Date().toISOString(),
      triggered,
    };
    return this.withUpdates({
      priceHistory: [...(this.priceHistory || []), newHistory],
      currentPrice: price,
      lastChecked: new Date().toISOString(),
    } as Partial<IPriceAlert>) as PriceAlert;
  }

  trigger(): PriceAlert {
    return this.withUpdates({
      triggeredCount: this.triggeredCount + 1,
    } as Partial<IPriceAlert>) as PriceAlert;
  }

  toggleActive(): PriceAlert {
    return this.withUpdates({
      active: !this.active,
    } as Partial<IPriceAlert>) as PriceAlert;
  }

  markAsChecked(): PriceAlert {
    return this.withUpdates({
      lastChecked: new Date().toISOString(),
    } as Partial<IPriceAlert>) as PriceAlert;
  }

  markAsTriggered(): PriceAlert {
    return this.withUpdates({
      lastTriggeredAt: new Date().toISOString(),
      triggeredCount: this.triggeredCount + 1,
    } as Partial<IPriceAlert>) as PriceAlert;
  }

  deactivate(): PriceAlert {
    return this.withUpdates({
      active: false,
    } as Partial<IPriceAlert>) as PriceAlert;
  }

  get lastTriggered(): string | undefined {
    return this.lastTriggeredAt;
  }

  static createNew(data: Omit<IPriceAlert, 'id' | 'createdAt' | 'updatedAt' | 'active' | 'triggeredCount'>): PriceAlert {
    const now = new Date().toISOString();
    return new PriceAlert({
      ...data,
      active: true,
      triggeredCount: 0,
      frequency: data.frequency || 'immediate',
      createdAt: now,
      updatedAt: now,
    });
  }
}
