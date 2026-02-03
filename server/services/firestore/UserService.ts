/**
 * UserService - Service for user operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { User, IUser } from '../../models/User.js';

export class UserService extends BaseService<IUser, User> {
  protected modelClass = User;

  constructor() {
    super('users');
  }

  /**
   * Get user by Firebase UID (uid is the document ID)
   */
  async getByUid(uid: string): Promise<User | null> {
    return this.findById(uid);
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: [
        { field: 'email', operator: '==', value: email }
      ]
    });
  }

  /**
   * Get all admin users
   */
  async getAdminUsers(
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<User>> {
    return this.findPaginated({
      where: [
        { field: 'isAdmin', operator: '==', value: true },
        { field: 'isDisabled', operator: '==', value: false }
      ],
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get all users with pagination (admin)
   */
  async getAllUsers(
    options: {
      limit?: number;
      startAfter?: any;
      includeDisabled?: boolean;
    } = {}
  ): Promise<PaginatedResult<User>> {
    const queryOptions: QueryOptions = {
      orderBy: [{ field: 'createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (!options.includeDisabled) {
      queryOptions.where = [
        { field: 'isDisabled', operator: '==', value: false }
      ];
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Create or update user
   */
  async upsertUser(uid: string, userData: Partial<IUser>): Promise<User> {
    const existing = await this.getByUid(uid);

    if (existing) {
      return this.update(uid, userData);
    } else {
      const newUser = User.createNew({
        uid,
        email: userData.email!,
        displayName: userData.displayName,
        photoURL: userData.photoURL
      });
      return this.createWithId(uid, newUser);
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(uid: string): Promise<User> {
    const user = await this.getByUid(uid);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = user.updateLastLogin();
    return this.update(uid, updatedUser.toFirestore());
  }

  /**
   * Grant admin privileges
   */
  async grantAdmin(uid: string): Promise<User> {
    const user = await this.getByUid(uid);
    if (!user) {
      throw new Error('User not found');
    }

    return this.update(uid, {
      isAdmin: true,
      metadata: {
        ...user.metadata,
        adminGrantedAt: new Date().toISOString()
      }
    });
  }

  /**
   * Revoke admin privileges
   */
  async revokeAdmin(uid: string): Promise<User> {
    const user = await this.getByUid(uid);
    if (!user) {
      throw new Error('User not found');
    }

    return this.update(uid, {
      isAdmin: false
    });
  }

  /**
   * Disable a user account
   */
  async disableUser(uid: string): Promise<User> {
    const user = await this.getByUid(uid);
    if (!user) {
      throw new Error('User not found');
    }

    return this.update(uid, {
      isDisabled: true,
      metadata: {
        ...user.metadata,
        disabledAt: new Date().toISOString()
      }
    });
  }

  /**
   * Enable a user account
   */
  async enableUser(uid: string): Promise<User> {
    const user = await this.getByUid(uid);
    if (!user) {
      throw new Error('User not found');
    }

    return this.update(uid, {
      isDisabled: false
    });
  }

  /**
   * Get user statistics (admin)
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    disabled: number;
    admins: number;
    recentSignups: number;
  }> {
    const users = await this.findAll();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    return {
      total: users.length,
      active: users.filter(u => !u.isDisabled).length,
      disabled: users.filter(u => u.isDisabled).length,
      admins: users.filter(u => u.isAdmin).length,
      recentSignups: users.filter(u => u.createdAt >= thirtyDaysAgoISO).length
    };
  }

  /**
   * Search users by name or email (client-side filtering)
   */
  async searchUsers(
    searchTerm: string,
    options: {
      limit?: number;
      includeDisabled?: boolean;
    } = {}
  ): Promise<User[]> {
    const queryOptions: QueryOptions = {
      limit: options.limit || 100
    };

    if (!options.includeDisabled) {
      queryOptions.where = [
        { field: 'isDisabled', operator: '==', value: false }
      ];
    }

    const users = await this.findAll(queryOptions);

    // Client-side filtering for flexible search
    const searchLower = searchTerm.toLowerCase();
    return users.filter(user => {
      const displayName = (user.displayName || '').toLowerCase();
      const email = user.email.toLowerCase();
      return displayName.includes(searchLower) || email.includes(searchLower);
    });
  }
}

// Export singleton instance
export const userService = new UserService();
