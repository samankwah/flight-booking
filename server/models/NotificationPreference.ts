/**
 * NotificationPreference Model - User notification preferences representation
 */

import { BaseModel } from './BaseModel.js';
import { NotificationPreferenceSchema } from '../schemas/notification.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface INotificationPreference extends IFirestoreDocument {
  userId: string;
  email: string;
  preferences: {
    priceAlerts: boolean;
    bookingConfirmations: boolean;
    flightReminders: boolean;
    promotions: boolean;
    applicationUpdates: boolean;
    visaUpdates: boolean;
  };
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
}

export class NotificationPreference extends BaseModel<INotificationPreference> implements INotificationPreference {
  userId!: string;
  email!: string;
  preferences!: INotificationPreference['preferences'];
  channels!: INotificationPreference['channels'];

  constructor(data: INotificationPreference) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    NotificationPreferenceSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    return {
      userId: this.userId,
      email: this.email,
      preferences: this.preferences,
      channels: this.channels,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  isEnabled(type: keyof INotificationPreference['preferences']): boolean {
    return this.preferences[type];
  }

  isChannelEnabled(channel: keyof INotificationPreference['channels']): boolean {
    return this.channels[channel];
  }

  enableAll(): NotificationPreference {
    const allEnabled = {
      priceAlerts: true,
      bookingConfirmations: true,
      flightReminders: true,
      promotions: true,
      applicationUpdates: true,
      visaUpdates: true,
    };
    return this.withUpdates({
      preferences: allEnabled,
      updatedAt: new Date().toISOString()
    }) as NotificationPreference;
  }

  disableAll(): NotificationPreference {
    const allDisabled = {
      priceAlerts: false,
      bookingConfirmations: false,
      flightReminders: false,
      promotions: false,
      applicationUpdates: false,
      visaUpdates: false,
    };
    return this.withUpdates({
      preferences: allDisabled,
      updatedAt: new Date().toISOString()
    }) as NotificationPreference;
  }

  static createDefault(userId: string, email: string): NotificationPreference {
    const now = new Date().toISOString();
    return new NotificationPreference({
      userId,
      email,
      preferences: {
        priceAlerts: true,
        bookingConfirmations: true,
        flightReminders: true,
        promotions: false,
        applicationUpdates: true,
        visaUpdates: true,
      },
      channels: {
        email: true,
        push: true,
        sms: false,
      },
      createdAt: now,
      updatedAt: now,
    });
  }
}
