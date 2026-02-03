/**
 * User Model - User profile representation
 */

import { BaseModel } from './BaseModel.js';
import { UserSchema } from '../schemas/user.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface IUser extends IFirestoreDocument {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  isDisabled: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other';
    nationality?: string;
    address?: string;
    city?: string;
    country?: string;
    postalCode?: string;
  };
  preferences?: {
    currency: string;
    language: string;
    timezone?: string;
    newsletter: boolean;
  };
  metadata?: {
    lastLogin?: string;
    loginCount: number;
    emailVerified: boolean;
    phoneVerified: boolean;
  };
}

export class User extends BaseModel<IUser> implements IUser {
  uid!: string;
  email!: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  isAdmin!: boolean;
  isDisabled!: boolean;
  profile?: IUser['profile'];
  preferences?: IUser['preferences'];
  metadata?: IUser['metadata'];

  constructor(data: IUser) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    UserSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      uid: this.uid,
      email: this.email,
      isAdmin: this.isAdmin,
      isDisabled: this.isDisabled,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.displayName) data.displayName = this.displayName;
    if (this.photoURL) data.photoURL = this.photoURL;
    if (this.phoneNumber) data.phoneNumber = this.phoneNumber;
    if (this.profile) data.profile = this.profile;
    if (this.preferences) data.preferences = this.preferences;
    if (this.metadata) data.metadata = this.metadata;

    return data;
  }

  getFullName(): string {
    if (this.profile?.firstName && this.profile?.lastName) {
      return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.displayName || this.email.split('@')[0];
  }

  isEmailVerified(): boolean {
    return this.metadata?.emailVerified || false;
  }

  recordLogin(): User {
    return this.withUpdates({
      metadata: {
        ...(this.metadata || { loginCount: 0, emailVerified: false, phoneVerified: false }),
        lastLogin: new Date().toISOString(),
        loginCount: (this.metadata?.loginCount || 0) + 1,
      },
    } as Partial<IUser>) as User;
  }

  updateLastLogin(): User {
    return this.recordLogin();
  }

  static createNew(uid: string, email: string, displayName?: string): User {
    const now = new Date().toISOString();
    return new User({
      uid,
      email,
      displayName,
      isAdmin: false,
      isDisabled: false,
      preferences: {
        currency: 'USD',
        language: 'en',
        newsletter: false,
      },
      metadata: {
        loginCount: 0,
        emailVerified: false,
        phoneVerified: false,
      },
      createdAt: now,
      updatedAt: now,
    });
  }
}
