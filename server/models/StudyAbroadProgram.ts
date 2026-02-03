/**
 * StudyAbroadProgram Model - Academic program representation
 */

import { BaseModel } from './BaseModel.js';
import { StudyAbroadProgramSchema } from '../schemas/program.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface IStudyAbroadProgram extends IFirestoreDocument {
  basicInfo: {
    programName: string;
    universityId: string;
    universityName: string;
    country: string;
    city: string;
    degree: 'bachelor' | 'master' | 'phd' | 'diploma' | 'certificate';
    field: string;
    specialization?: string;
    duration: string;
    startDates: string[];
    language: string;
  };
  academics: {
    description: string;
    curriculum: string[];
    learningOutcomes: string[];
    accreditation?: string;
    ranking?: number;
  };
  admission: {
    requirements: string[];
    minimumGPA?: number;
    englishRequirements?: {
      ielts?: number;
      toefl?: number;
      other?: string;
    };
    applicationDeadline: string;
    intakeMonths: string[];
  };
  fees: {
    tuitionFee: number;
    applicationFee: number;
    currency: string;
    scholarshipsAvailable: boolean;
    scholarshipDetails?: string;
  };
  career: {
    careerProspects: string[];
    averageSalary?: number;
    salaryCurrency?: string;
    employmentRate?: number;
  };
  settings: {
    isActive: boolean;
    isFeatured: boolean;
    priority: number;
    capacity?: number;
    enrolledStudents?: number;
    createdAt: string;
    lastUpdated: string;
  };
}

export class StudyAbroadProgram extends BaseModel<IStudyAbroadProgram> implements IStudyAbroadProgram {
  basicInfo!: IStudyAbroadProgram['basicInfo'];
  academics!: IStudyAbroadProgram['academics'];
  admission!: IStudyAbroadProgram['admission'];
  fees!: IStudyAbroadProgram['fees'];
  career!: IStudyAbroadProgram['career'];
  settings!: IStudyAbroadProgram['settings'];

  constructor(data: IStudyAbroadProgram) {
    super(data);
    Object.assign(this, data);
  }

  validate(): void {
    StudyAbroadProgramSchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    return {
      basicInfo: this.basicInfo,
      academics: this.academics,
      admission: this.admission,
      fees: this.fees,
      career: this.career,
      settings: this.settings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  isActive(): boolean {
    return this.settings.isActive;
  }

  isFeatured(): boolean {
    return this.settings.isFeatured;
  }

  hasCapacity(): boolean {
    if (!this.settings.capacity || !this.settings.enrolledStudents) return true;
    return this.settings.enrolledStudents < this.settings.capacity;
  }

  toggleActive(): StudyAbroadProgram {
    return this.withUpdates({
      settings: {
        ...this.settings,
        isActive: !this.settings.isActive,
        lastUpdated: new Date().toISOString()
      },
    } as Partial<IStudyAbroadProgram>) as StudyAbroadProgram;
  }

  incrementApplicationCount(): StudyAbroadProgram {
    const currentCount = (this.settings as any).applicationCount || 0;
    return this.withUpdates({
      settings: {
        ...this.settings,
        applicationCount: currentCount + 1,
        lastUpdated: new Date().toISOString()
      } as any,
    } as Partial<IStudyAbroadProgram>) as StudyAbroadProgram;
  }

  hasScholarships(): boolean {
    return this.fees.scholarshipsAvailable === true;
  }

  static createNew(data: Omit<IStudyAbroadProgram, 'id' | 'createdAt' | 'updatedAt'>): StudyAbroadProgram {
    const now = new Date().toISOString();
    return new StudyAbroadProgram({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }
}
