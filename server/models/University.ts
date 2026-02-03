/**
 * University Model - University profile representation
 */

import { BaseModel } from './BaseModel.js';
import {
  UniversitySchema,
  BasicInfo,
  Academics,
  Facilities,
  Programs,
  Fees,
  Admission,
  Partnerships,
  Media,
  Settings,
} from '../schemas/university.schema.js';
import { IFirestoreDocument } from '../types/shared.js';

export interface IUniversity extends IFirestoreDocument {
  basicInfo: BasicInfo;
  academics: Academics;
  facilities: Facilities;
  programs: Programs;
  fees: Fees;
  admission: Admission;
  partnerships: Partnerships;
  media: Media;
  settings: Settings;
}

export class University extends BaseModel<IUniversity> implements IUniversity {
  basicInfo: BasicInfo;
  academics: Academics;
  facilities: Facilities;
  programs: Programs;
  fees: Fees;
  admission: Admission;
  partnerships: Partnerships;
  media: Media;
  settings: Settings;

  constructor(data: IUniversity) {
    super(data);
    this.basicInfo = data.basicInfo;
    this.academics = data.academics;
    this.facilities = data.facilities;
    this.programs = data.programs;
    this.fees = data.fees;
    this.admission = data.admission;
    this.partnerships = data.partnerships;
    this.media = data.media;
    this.settings = data.settings;
  }

  validate(): void {
    UniversitySchema.parse(this.toFirestore());
  }

  toFirestore(): Record<string, any> {
    return {
      basicInfo: this.basicInfo,
      academics: this.academics,
      facilities: this.facilities,
      programs: this.programs,
      fees: this.fees,
      admission: this.admission,
      partnerships: this.partnerships,
      media: this.media,
      settings: this.settings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Helper methods
  isActive(): boolean {
    return this.settings.isActive;
  }

  isFeatured(): boolean {
    return this.settings.isFeatured;
  }

  isPartnered(): boolean {
    return this.partnerships.isPartnered;
  }

  getName(): string {
    return this.basicInfo.name;
  }

  getLocation(): string {
    return `${this.basicInfo.city}, ${this.basicInfo.country}`;
  }

  getTotalPrograms(): number {
    return this.programs.totalPrograms;
  }

  getUndergraduateFeeRange(): string {
    return `${this.fees.undergraduate.min}-${this.fees.undergraduate.max} ${this.fees.undergraduate.currency}`;
  }

  getPostgraduateFeeRange(): string {
    return `${this.fees.postgraduate.min}-${this.fees.postgraduate.max} ${this.fees.postgraduate.currency}`;
  }

  hasProgram(programName: string): boolean {
    const lowerName = programName.toLowerCase();
    return [
      ...this.programs.undergraduate,
      ...this.programs.postgraduate,
      ...this.programs.phd,
    ].some(p => p.toLowerCase().includes(lowerName));
  }

  static createNew(data: Omit<IUniversity, 'id' | 'createdAt' | 'updatedAt'>): University {
    const now = new Date().toISOString();
    return new University({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
  }

  toggleFeatured(): University {
    return this.withUpdates({
      settings: {
        ...this.settings,
        isFeatured: !this.settings.isFeatured,
      },
    } as Partial<IUniversity>) as University;
  }

  toggleActive(): University {
    return this.withUpdates({
      settings: {
        ...this.settings,
        isActive: !this.settings.isActive,
      },
    } as Partial<IUniversity>) as University;
  }

  incrementApplicationCount(): University {
    const currentCount = (this.settings as any).applicationCount || 0;
    return this.withUpdates({
      settings: {
        ...this.settings,
        applicationCount: currentCount + 1,
      } as any,
    } as Partial<IUniversity>) as University;
  }
}
