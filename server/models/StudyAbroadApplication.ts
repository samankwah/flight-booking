/**
 * StudyAbroadApplication Model - Legacy study abroad application representation
 */

import { BaseModel } from './BaseModel.js';
import { StudyAbroadApplicationSchema } from '../schemas/studyAbroadApplication.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface IStudyAbroadApplication extends IFirestoreDocument {
  userId: string;
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    nationality: string;
  };
  programPreferences: {
    preferredCountries: string[];
    fieldOfStudy: string;
    degreeLevel: 'bachelor' | 'master' | 'phd';
    startTerm: string;
    budgetRange: {
      min: number;
      max: number;
      currency: string;
    };
  };
  academicBackground: {
    currentEducationLevel: string;
    institution: string;
    gpa?: number;
    expectedGraduation: string;
  };
  status: 'inquiry' | 'consulting' | 'applying' | 'admitted' | 'enrolled' | 'cancelled';
  assignedConsultant?: string;
  notes?: string;
  submittedAt: string;
}

export class StudyAbroadApplication extends BaseModel<IStudyAbroadApplication> implements IStudyAbroadApplication {
  userId!: string;
  studentInfo!: IStudyAbroadApplication['studentInfo'];
  programPreferences!: IStudyAbroadApplication['programPreferences'];
  academicBackground!: IStudyAbroadApplication['academicBackground'];
  status!: IStudyAbroadApplication['status'];
  assignedConsultant?: string;
  notes?: string;
  submittedAt!: string;

  constructor(data: IStudyAbroadApplication) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    StudyAbroadApplicationSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    const data: Record<string, any> = {
      userId: this.userId,
      studentInfo: this.studentInfo,
      programPreferences: this.programPreferences,
      academicBackground: this.academicBackground,
      status: this.status,
      submittedAt: this.submittedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if (this.assignedConsultant) data.assignedConsultant = this.assignedConsultant;
    if (this.notes) data.notes = this.notes;

    return data;
  }

  getStudentName(): string {
    return `${this.studentInfo.firstName} ${this.studentInfo.lastName}`;
  }

  isAssigned(): boolean {
    return !!this.assignedConsultant;
  }

  static createNew(data: Omit<IStudyAbroadApplication, 'id' | 'createdAt' | 'updatedAt' | 'submittedAt' | 'status'>): StudyAbroadApplication {
    const now = new Date().toISOString();
    return new StudyAbroadApplication({
      ...data,
      status: 'inquiry',
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  assignConsultant(consultantId: string): StudyAbroadApplication {
    return this.withUpdates({
      assignedConsultant: consultantId,
      status: 'consulting',
    } as Partial<IStudyAbroadApplication>) as StudyAbroadApplication;
  }
}
