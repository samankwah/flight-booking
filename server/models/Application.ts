/**
 * Application Model - Study Abroad Application representation
 */

import { BaseModel } from './BaseModel.js';
import { ApplicationSchema } from '../schemas/application.schema.js';
import { IFirestoreDocument, ApplicationStatus } from '../types/shared.js';

export interface IApplication extends IFirestoreDocument {
  applicant: {
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
    passportNumber?: string;
  };
  university: {
    id: string;
    name: string;
    country: string;
    city: string;
  };
  program: {
    id: string;
    name: string;
    degree: string;
    duration: string;
    fees: { amount: number; currency: string };
  };
  academics: {
    highestQualification: string;
    institution: string;
    gpa?: number;
    graduationYear: number;
    transcriptUrl?: string;
  };
  documents: {
    transcript: { uploaded: boolean; verified: boolean; url?: string; verifiedAt?: string; verifiedBy?: string };
    passport: { uploaded: boolean; verified: boolean; url?: string; verifiedAt?: string; verifiedBy?: string };
    recommendation: { uploaded: boolean; verified: boolean; url?: string; verifiedAt?: string; verifiedBy?: string };
    sop: { uploaded: boolean; verified: boolean; url?: string; verifiedAt?: string; verifiedBy?: string };
    englishTest: { uploaded: boolean; verified: boolean; url?: string; verifiedAt?: string; verifiedBy?: string };
  };
  workflow: {
    status: ApplicationStatus;
    submittedAt?: string;
    reviewedAt?: string;
    completedAt?: string;
    priority?: 'low' | 'medium' | 'high';
    assignedTo?: string;
    notes?: string;
  };
  payment: {
    applicationFee: number;
    currency: string;
    paid: boolean;
    transactionReference?: string;
  };
  communications?: Array<{ from: string; message: string; timestamp: string }>;
  timeline?: Array<{ event: string; timestamp: string; actor?: string }>;
  adminNotes?: string;
}

export class Application extends BaseModel<IApplication> implements IApplication {
  applicant!: IApplication['applicant'];
  university!: IApplication['university'];
  program!: IApplication['program'];
  academics!: IApplication['academics'];
  documents!: IApplication['documents'];
  workflow!: IApplication['workflow'];
  payment!: IApplication['payment'];
  communications?: IApplication['communications'];
  timeline?: IApplication['timeline'];
  adminNotes?: string;

  constructor(data: IApplication) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    ApplicationSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      applicant: this.applicant,
      university: this.university,
      program: this.program,
      academics: this.academics,
      documents: this.documents,
      workflow: this.workflow,
      payment: this.payment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.communications) data.communications = this.communications;
    if (this.timeline) data.timeline = this.timeline;
    if (this.adminNotes) data.adminNotes = this.adminNotes;

    return data;
  }

  // Helper methods
  isSubmitted(): boolean {
    return this.workflow.status !== 'draft';
  }

  isApproved(): boolean {
    return this.workflow.status === 'approved';
  }

  areAllDocumentsUploaded(): boolean {
    return Object.values(this.documents).every(doc => doc.uploaded);
  }

  areAllDocumentsVerified(): boolean {
    return Object.values(this.documents).every(doc => doc.verified);
  }

  getApplicantName(): string {
    return `${this.applicant.firstName} ${this.applicant.lastName}`;
  }

  addCommunication(from: string, message: string): Application {
    const newComm = { from, message, timestamp: new Date().toISOString() };
    return this.withUpdates({
      communications: [...(this.communications || []), newComm],
    } as Partial<IApplication>) as Application;
  }

  addTimelineEvent(event: string, actor?: string): Application {
    const newEvent = { event, timestamp: new Date().toISOString(), actor };
    return this.withUpdates({
      timeline: [...(this.timeline || []), newEvent],
    } as Partial<IApplication>) as Application;
  }

  static createNew(data: Omit<IApplication, 'id' | 'createdAt' | 'updatedAt' | 'workflow'>): Application {
    const now = new Date().toISOString();
    return new Application({
      ...data,
      workflow: {
        status: 'draft',
      },
      createdAt: now,
      updatedAt: now,
    });
  }

  submit(): Application {
    return this.withUpdates({
      workflow: {
        ...this.workflow,
        status: 'submitted',
        submittedAt: new Date().toISOString(),
      },
    } as Partial<IApplication>) as Application;
  }

  approve(): Application {
    return this.withUpdates({
      workflow: {
        ...this.workflow,
        status: 'approved',
        completedAt: new Date().toISOString(),
      },
    } as Partial<IApplication>) as Application;
  }

  accept(): Application {
    return this.approve();
  }

  reject(reason?: string): Application {
    return this.withUpdates({
      workflow: {
        ...this.workflow,
        status: 'rejected',
        completedAt: new Date().toISOString(),
        notes: reason || this.workflow.notes,
      },
    } as Partial<IApplication>) as Application;
  }

  waitlist(reason?: string): Application {
    return this.withUpdates({
      workflow: {
        ...this.workflow,
        status: 'waitlisted',
        notes: reason || this.workflow.notes,
      },
    } as Partial<IApplication>) as Application;
  }

  assignTo(adminId: string): Application {
    return this.withUpdates({
      workflow: {
        ...this.workflow,
        assignedTo: adminId,
      },
    } as Partial<IApplication>) as Application;
  }

  setPriority(priority: 'low' | 'medium' | 'high' | 'urgent'): Application {
    return this.withUpdates({
      workflow: {
        ...this.workflow,
        priority,
      },
    } as Partial<IApplication>) as Application;
  }

  markDocumentVerified(documentType: string, verifiedBy: string): Application {
    const updatedDocuments = { ...this.documents };
    if (updatedDocuments[documentType as keyof typeof updatedDocuments]) {
      updatedDocuments[documentType as keyof typeof updatedDocuments] = {
        ...updatedDocuments[documentType as keyof typeof updatedDocuments],
        verified: true,
        verifiedAt: new Date().toISOString(),
        verifiedBy,
      };
    }
    return this.withUpdates({
      documents: updatedDocuments,
    } as Partial<IApplication>) as Application;
  }
}
