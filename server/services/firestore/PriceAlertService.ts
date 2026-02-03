/**
 * PriceAlertService - Service for price alert operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { PriceAlert, IPriceAlert } from '../../models/PriceAlert.js';

export class PriceAlertService extends BaseService<IPriceAlert, PriceAlert> {
  protected modelClass = PriceAlert;

  constructor() {
    super('priceAlerts');
  }

  /**
   * Get all price alerts for a specific user
   */
  async getUserAlerts(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      activeOnly?: boolean;
    } = {}
  ): Promise<PaginatedResult<PriceAlert>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (options.activeOnly) {
      queryOptions.where!.push({
        field: 'active',
        operator: '==',
        value: true
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get active alerts that need to be checked
   */
  async getAlertsToCheck(
    options: {
      limit?: number;
      lastCheckedBefore?: string;
    } = {}
  ): Promise<PriceAlert[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'active', operator: '==', value: true }
      ],
      orderBy: [{ field: 'lastChecked', direction: 'asc' }],
      limit: options.limit || 100
    };

    if (options.lastCheckedBefore) {
      queryOptions.where!.push({
        field: 'lastChecked',
        operator: '<=',
        value: options.lastCheckedBefore
      });
    }

    return this.findAll(queryOptions);
  }

  /**
   * Get alerts triggered recently
   */
  async getTriggeredAlerts(
    options: {
      limit?: number;
      since?: string;
      userId?: string;
    } = {}
  ): Promise<PriceAlert[]> {
    const queryOptions: QueryOptions = {
      limit: options.limit || 100
    };

    const where: QueryOptions['where'] = [];

    if (options.userId) {
      where.push({
        field: 'userId',
        operator: '==',
        value: options.userId
      });
    }

    if (where.length > 0) {
      queryOptions.where = where;
    }

    const alerts = await this.findAll(queryOptions);

    // Filter for triggered alerts
    return alerts.filter(alert => {
      if (!alert.lastTriggered) return false;
      if (options.since) {
        return alert.lastTriggered >= options.since;
      }
      return true;
    });
  }

  /**
   * Mark alert as checked
   */
  async markAsChecked(
    alertId: string,
    currentPrice?: number
  ): Promise<PriceAlert> {
    const alert = await this.findById(alertId);
    if (!alert) {
      throw new Error('Price alert not found');
    }

    const checkedAlert = alert.markAsChecked(currentPrice);
    return this.update(alertId, checkedAlert.toFirestore());
  }

  /**
   * Mark alert as triggered
   */
  async markAsTriggered(
    alertId: string,
    currentPrice: number
  ): Promise<PriceAlert> {
    const alert = await this.findById(alertId);
    if (!alert) {
      throw new Error('Price alert not found');
    }

    const triggeredAlert = alert.markAsTriggered(currentPrice);
    return this.update(alertId, triggeredAlert.toFirestore());
  }

  /**
   * Deactivate an alert
   */
  async deactivateAlert(alertId: string): Promise<PriceAlert> {
    const alert = await this.findById(alertId);
    if (!alert) {
      throw new Error('Price alert not found');
    }

    const deactivatedAlert = alert.deactivate();
    return this.update(alertId, deactivatedAlert.toFirestore());
  }

  /**
   * Activate an alert
   */
  async activateAlert(alertId: string): Promise<PriceAlert> {
    const alert = await this.findById(alertId);
    if (!alert) {
      throw new Error('Price alert not found');
    }

    return this.update(alertId, {
      active: true
    });
  }

  /**
   * Get alert statistics for a user
   */
  async getUserStatistics(userId: string): Promise<{
    total: number;
    active: number;
    triggered: number;
    averageTargetPrice: number;
  }> {
    const alerts = await this.findAll({
      where: [{ field: 'userId', operator: '==', value: userId }]
    });

    const triggered = alerts.filter(a => a.lastTriggered).length;
    const avgTarget = alerts.length > 0
      ? alerts.reduce((sum, a) => sum + a.targetPrice, 0) / alerts.length
      : 0;

    return {
      total: alerts.length,
      active: alerts.filter(a => a.active).length,
      triggered,
      averageTargetPrice: avgTarget
    };
  }

  /**
   * Get popular routes from alerts
   */
  async getPopularRoutes(limit: number = 10): Promise<Array<{
    route: string;
    count: number;
    avgTargetPrice: number;
  }>> {
    const alerts = await this.findAll({
      where: [{ field: 'active', operator: '==', value: true }]
    });

    // Count alerts by route
    const routeData = new Map<string, { count: number; totalPrice: number }>();

    for (const alert of alerts) {
      const route = `${alert.route.from}-${alert.route.to}`;
      const existing = routeData.get(route);

      if (existing) {
        existing.count++;
        existing.totalPrice += alert.targetPrice;
      } else {
        routeData.set(route, {
          count: 1,
          totalPrice: alert.targetPrice
        });
      }
    }

    // Convert to array and sort
    return Array.from(routeData.entries())
      .map(([route, data]) => ({
        route,
        count: data.count,
        avgTargetPrice: data.totalPrice / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Subscribe to real-time updates for user alerts
   */
  subscribeToUserAlerts(
    userId: string,
    callback: (alerts: PriceAlert[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.onSnapshotQuery(
      {
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limit: 50
      },
      callback,
      errorCallback
    );
  }
}

// Export singleton instance
export const priceAlertService = new PriceAlertService();
