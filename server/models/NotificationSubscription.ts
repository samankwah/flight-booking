/**
 * NotificationSubscription Model - Push notification subscription representation
 */

import { BaseModel } from './BaseModel.js';
import { NotificationSubscriptionSchema } from '../schemas/notification.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface INotificationSubscription extends IFirestoreDocument {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  isActive: boolean;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

export class NotificationSubscription extends BaseModel<INotificationSubscription> implements INotificationSubscription {
  userId!: string;
  endpoint!: string;
  keys!: { p256dh: string; auth: string };
  isActive!: boolean;
  deviceInfo?: { browser?: string; os?: string; device?: string };

  constructor(data: INotificationSubscription) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    NotificationSubscriptionSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      endpoint: this.endpoint,
      keys: this.keys,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.deviceInfo) data.deviceInfo = this.deviceInfo;
    return data;
  }

  deactivate(): NotificationSubscription {
    return this.withUpdates({
      isActive: false,
      updatedAt: new Date().toISOString()
    }) as NotificationSubscription;
  }

  static createNew(data: Omit<INotificationSubscription, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>): NotificationSubscription {
    const now = new Date().toISOString();
    return new NotificationSubscription({
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }
}
