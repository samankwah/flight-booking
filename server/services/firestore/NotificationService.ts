/**
 * NotificationService - Service for notification subscriptions and preferences
 */

import { BaseService } from './BaseService.js';
import { NotificationSubscription, INotificationSubscription } from '../../models/NotificationSubscription.js';
import { NotificationPreference, INotificationPreference } from '../../models/NotificationPreference.js';

export class NotificationSubscriptionService extends BaseService<INotificationSubscription, NotificationSubscription> {
  protected modelClass = NotificationSubscription;

  constructor() {
    super('notification-subscriptions');
  }

  /**
   * Get all active subscriptions for a user
   */
  async getUserSubscriptions(userId: string): Promise<NotificationSubscription[]> {
    return this.findAll({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'isActive', operator: '==', value: true }
      ]
    });
  }

  /**
   * Get subscription by endpoint
   */
  async getByEndpoint(endpoint: string): Promise<NotificationSubscription | null> {
    return this.findOne({
      where: [
        { field: 'endpoint', operator: '==', value: endpoint }
      ]
    });
  }

  /**
   * Deactivate a subscription
   */
  async deactivateSubscription(subscriptionId: string): Promise<NotificationSubscription> {
    const subscription = await this.findById(subscriptionId);
    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const deactivated = subscription.deactivate();
    return this.update(subscriptionId, deactivated.toFirestore());
  }

  /**
   * Remove inactive subscriptions for a user
   */
  async removeInactiveSubscriptions(userId: string): Promise<void> {
    const subscriptions = await this.findAll({
      where: [
        { field: 'userId', operator: '==', value: userId },
        { field: 'isActive', operator: '==', value: false }
      ]
    });

    const ids = subscriptions.map(s => s.id!);
    if (ids.length > 0) {
      await this.deleteMany(ids);
    }
  }
}

export class NotificationPreferenceService extends BaseService<INotificationPreference, NotificationPreference> {
  protected modelClass = NotificationPreference;

  constructor() {
    super('notification-preferences');
  }

  /**
   * Get preferences for a user (userId is the document ID)
   */
  async getUserPreferences(userId: string): Promise<NotificationPreference | null> {
    return this.findById(userId);
  }

  /**
   * Create or update user preferences
   */
  async setUserPreferences(
    userId: string,
    preferences: Partial<INotificationPreference>
  ): Promise<NotificationPreference> {
    const existing = await this.findById(userId);

    if (existing) {
      return this.update(userId, preferences);
    } else {
      const newPrefs = NotificationPreference.createDefault(userId);
      Object.assign(newPrefs, preferences);
      return this.createWithId(userId, newPrefs);
    }
  }

  /**
   * Enable all notifications for a user
   */
  async enableAll(userId: string): Promise<NotificationPreference> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) {
      const newPrefs = NotificationPreference.createDefault(userId);
      const enabled = newPrefs.enableAll();
      return this.createWithId(userId, enabled);
    }

    const enabled = prefs.enableAll();
    return this.update(userId, enabled.toFirestore());
  }

  /**
   * Disable all notifications for a user
   */
  async disableAll(userId: string): Promise<NotificationPreference> {
    const prefs = await this.getUserPreferences(userId);
    if (!prefs) {
      const newPrefs = NotificationPreference.createDefault(userId);
      const disabled = newPrefs.disableAll();
      return this.createWithId(userId, disabled);
    }

    const disabled = prefs.disableAll();
    return this.update(userId, disabled.toFirestore());
  }
}

// Export singleton instances
export const notificationSubscriptionService = new NotificationSubscriptionService();
export const notificationPreferenceService = new NotificationPreferenceService();
