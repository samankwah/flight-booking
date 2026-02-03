/**
 * VisaApplication Model - Visa application representation
 */

import { BaseModel } from './BaseModel.js';
import {
  VisaApplicationSchema,
  PersonalInfo,
  ContactInfo,
  TravelDetails,
  EmploymentInfo,
  SupportingDocuments,
} from '../schemas/visa.schema.js';
import { IFirestoreDocument, VisaStatus } from '../types/shared.js';

export interface IVisaApplication extends IFirestoreDocument {
  userId: string;
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  travelDetails: TravelDetails;
  employmentInfo?: EmploymentInfo;
  supportingDocuments?: SupportingDocuments;
  type: 'tourist' | 'business' | 'student' | 'work' | 'transit' | 'family' | 'medical';
  visaDuration: 'single_entry' | 'multiple_entry' | '30_days' | '90_days' | '180_days' | '1_year' | '5_years';
  status: VisaStatus;
  applicationNumber?: string;
  submittedAt: string;
  processingStartedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  fees: {
    applicationFee: number;
    processingFee?: number;
    total: number;
    currency: string;
    paid: boolean;
    transactionReference?: string;
  };
}

export class VisaApplication extends BaseModel<IVisaApplication> implements IVisaApplication {
  userId!: string;
  personalInfo!: PersonalInfo;
  contactInfo!: ContactInfo;
  travelDetails!: TravelDetails;
  employmentInfo?: EmploymentInfo;
  supportingDocuments?: SupportingDocuments;
  type!: 'tourist' | 'business' | 'student' | 'work' | 'transit' | 'family' | 'medical';
  visaDuration!: 'single_entry' | 'multiple_entry' | '30_days' | '90_days' | '180_days' | '1_year' | '5_years';
  status!: VisaStatus;
  applicationNumber?: string;
  submittedAt!: string;
  processingStartedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
  adminNotes?: string;
  fees!: {
    applicationFee: number;
    processingFee?: number;
    total: number;
    currency: string;
    paid: boolean;
    transactionReference?: string;
  };

  constructor(data: IVisaApplication) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    VisaApplicationSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      personalInfo: this.personalInfo,
      contactInfo: this.contactInfo,
      travelDetails: this.travelDetails,
      type: this.type,
      visaDuration: this.visaDuration,
      status: this.status,
      submittedAt: this.submittedAt,
      fees: this.fees,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.employmentInfo) data.employmentInfo = this.employmentInfo;
    if (this.supportingDocuments) data.supportingDocuments = this.supportingDocuments;
    if (this.applicationNumber) data.applicationNumber = this.applicationNumber;
    if (this.processingStartedAt) data.processingStartedAt = this.processingStartedAt;
    if (this.completedAt) data.completedAt = this.completedAt;
    if (this.rejectionReason) data.rejectionReason = this.rejectionReason;
    if (this.adminNotes) data.adminNotes = this.adminNotes;

    return data;
  }

  // Helper methods
  isApproved(): boolean {
    return this.status === 'approved';
  }

  isRejected(): boolean {
    return this.status === 'rejected';
  }

  isProcessing(): boolean {
    return this.status === 'processing';
  }

  getApplicantName(): string {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
  }

  getDurationOfStay(): number {
    return this.travelDetails.durationOfStay;
  }

  hasExpiredPassport(): boolean {
    return new Date(this.personalInfo.passportExpiryDate) < new Date();
  }

  needsRenewal(): boolean {
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
    return new Date(this.personalInfo.passportExpiryDate) < sixMonthsFromNow;
  }

  static createNew(data: Omit<IVisaApplication, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'status'>): VisaApplication {
    const now = new Date().toISOString();
    return new VisaApplication({
      ...data,
      status: 'submitted',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  startProcessing(): VisaApplication {
    return this.withUpdates({
      status: 'processing',
      processingStartedAt: new Date().toISOString(),
    } as Partial<IVisaApplication>) as VisaApplication;
  }

  approve(): VisaApplication {
    return this.withUpdates({
      status: 'approved',
      completedAt: new Date().toISOString(),
    } as Partial<IVisaApplication>) as VisaApplication;
  }

  reject(reason: string): VisaApplication {
    return this.withUpdates({
      status: 'rejected',
      rejectionReason: reason,
      completedAt: new Date().toISOString(),
    } as Partial<IVisaApplication>) as VisaApplication;
  }

  submit(): VisaApplication {
    return this.withUpdates({
      status: 'submitted',
      submittedAt: new Date().toISOString(),
    } as Partial<IVisaApplication>) as VisaApplication;
  }

  addDocument(documentType: string, documentUrl: string): VisaApplication {
    const currentDocs = this.supportingDocuments || {
      passport: '',
      photo: '',
      financialProof: '',
      travelItinerary: '',
      accommodationProof: ''
    };

    return this.withUpdates({
      supportingDocuments: {
        ...currentDocs,
        [documentType]: documentUrl
      },
    } as Partial<IVisaApplication>) as VisaApplication;
  }
}
