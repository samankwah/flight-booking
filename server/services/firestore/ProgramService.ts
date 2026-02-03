/**
 * ProgramService - Service for study abroad program operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { StudyAbroadProgram, IStudyAbroadProgram } from '../../models/StudyAbroadProgram.js';

export class ProgramService extends BaseService<IStudyAbroadProgram, StudyAbroadProgram> {
  protected modelClass = StudyAbroadProgram;

  constructor() {
    super('studyAbroadPrograms');
  }

  /**
   * Get all active programs with pagination
   */
  async getActivePrograms(
    options: {
      limit?: number;
      startAfter?: any;
      universityId?: string;
      degree?: string;
    } = {}
  ): Promise<PaginatedResult<StudyAbroadProgram>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'settings.isActive', operator: '==', value: true }],
      orderBy: [{ field: 'settings.createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (options.universityId) {
      queryOptions.where!.push({
        field: 'basicInfo.universityId',
        operator: '==',
        value: options.universityId
      });
    }

    if (options.degree) {
      queryOptions.where!.push({
        field: 'basicInfo.degree',
        operator: '==',
        value: options.degree
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get programs for a specific university
   */
  async getUniversityPrograms(
    universityId: string,
    options: {
      limit?: number;
      startAfter?: any;
      activeOnly?: boolean;
      degree?: string;
    } = {}
  ): Promise<PaginatedResult<StudyAbroadProgram>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'basicInfo.universityId', operator: '==', value: universityId }
      ],
      orderBy: [{ field: 'basicInfo.name', direction: 'asc' }],
      limit: options.limit || 100,
      startAfter: options.startAfter
    };

    if (options.activeOnly) {
      queryOptions.where!.push({
        field: 'settings.isActive',
        operator: '==',
        value: true
      });
    }

    if (options.degree) {
      queryOptions.where!.push({
        field: 'basicInfo.degree',
        operator: '==',
        value: options.degree
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get programs by degree level
   */
  async getProgramsByDegree(
    degree: string,
    options: {
      limit?: number;
      startAfter?: any;
      activeOnly?: boolean;
    } = {}
  ): Promise<PaginatedResult<StudyAbroadProgram>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'basicInfo.degree', operator: '==', value: degree }
      ],
      orderBy: [{ field: 'settings.createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (options.activeOnly) {
      queryOptions.where!.push({
        field: 'settings.isActive',
        operator: '==',
        value: true
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Search programs by name (client-side filtering)
   */
  async searchByName(
    searchTerm: string,
    options: {
      limit?: number;
      universityId?: string;
      degree?: string;
      activeOnly?: boolean;
    } = {}
  ): Promise<StudyAbroadProgram[]> {
    const queryOptions: QueryOptions = {
      limit: options.limit || 100
    };

    const where: QueryOptions['where'] = [];

    if (options.universityId) {
      where.push({
        field: 'basicInfo.universityId',
        operator: '==',
        value: options.universityId
      });
    }

    if (options.degree) {
      where.push({
        field: 'basicInfo.degree',
        operator: '==',
        value: options.degree
      });
    }

    if (options.activeOnly) {
      where.push({
        field: 'settings.isActive',
        operator: '==',
        value: true
      });
    }

    if (where.length > 0) {
      queryOptions.where = where;
    }

    const programs = await this.findAll(queryOptions);

    // Client-side filtering for flexible name search
    const searchLower = searchTerm.toLowerCase();
    return programs.filter(program =>
      program.basicInfo.name.toLowerCase().includes(searchLower) ||
      program.basicInfo.field.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get program by slug
   */
  async getBySlug(slug: string): Promise<StudyAbroadProgram | null> {
    return this.findOne({
      where: [
        { field: 'basicInfo.slug', operator: '==', value: slug }
      ]
    });
  }

  /**
   * Get affordable programs (sorted by tuition)
   */
  async getAffordablePrograms(
    maxTuition: number,
    currency: string = 'USD',
    options: {
      limit?: number;
      degree?: string;
    } = {}
  ): Promise<StudyAbroadProgram[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'settings.isActive', operator: '==', value: true }
      ],
      limit: options.limit || 100
    };

    if (options.degree) {
      queryOptions.where!.push({
        field: 'basicInfo.degree',
        operator: '==',
        value: options.degree
      });
    }

    const programs = await this.findAll(queryOptions);

    // Filter by tuition (client-side for cross-currency comparison)
    return programs
      .filter(program => {
        const tuition = program.academics.tuition;
        return tuition.currency === currency && tuition.amount <= maxTuition;
      })
      .sort((a, b) => a.academics.tuition.amount - b.academics.tuition.amount);
  }

  /**
   * Get programs with scholarships available
   */
  async getProgramsWithScholarships(
    options: {
      limit?: number;
      degree?: string;
      universityId?: string;
    } = {}
  ): Promise<StudyAbroadProgram[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'settings.isActive', operator: '==', value: true }
      ],
      limit: options.limit || 100
    };

    if (options.degree) {
      queryOptions.where!.push({
        field: 'basicInfo.degree',
        operator: '==',
        value: options.degree
      });
    }

    if (options.universityId) {
      queryOptions.where!.push({
        field: 'basicInfo.universityId',
        operator: '==',
        value: options.universityId
      });
    }

    const programs = await this.findAll(queryOptions);

    // Filter programs with scholarships
    return programs.filter(program => program.hasScholarships());
  }

  /**
   * Toggle program active status
   */
  async toggleActive(programId: string): Promise<StudyAbroadProgram> {
    const program = await this.findById(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    const updatedProgram = program.toggleActive();
    return this.update(programId, updatedProgram.toFirestore());
  }

  /**
   * Increment application count
   */
  async incrementApplicationCount(programId: string): Promise<StudyAbroadProgram> {
    const program = await this.findById(programId);
    if (!program) {
      throw new Error('Program not found');
    }

    const updatedProgram = program.incrementApplicationCount();
    return this.update(programId, updatedProgram.toFirestore());
  }

  /**
   * Get program statistics (admin)
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byDegree: Record<string, number>;
    totalApplications: number;
  }> {
    const programs = await this.findAll();

    const byDegree: Record<string, number> = {};
    let totalApplications = 0;

    for (const program of programs) {
      const degree = program.basicInfo.degree;
      byDegree[degree] = (byDegree[degree] || 0) + 1;
      totalApplications += program.settings.applicationCount || 0;
    }

    return {
      total: programs.length,
      active: programs.filter(p => p.settings.isActive).length,
      inactive: programs.filter(p => !p.settings.isActive).length,
      byDegree,
      totalApplications
    };
  }

  /**
   * Get programs with highest application counts
   */
  async getTopProgramsByApplications(limit: number = 10): Promise<StudyAbroadProgram[]> {
    const programs = await this.findAll({
      where: [
        { field: 'settings.isActive', operator: '==', value: true }
      ]
    });

    // Sort by application count
    return programs
      .sort((a, b) => (b.settings.applicationCount || 0) - (a.settings.applicationCount || 0))
      .slice(0, limit);
  }

  /**
   * Subscribe to real-time updates for university programs
   */
  subscribeToUniversityPrograms(
    universityId: string,
    callback: (programs: StudyAbroadProgram[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.onSnapshotQuery(
      {
        where: [
          { field: 'basicInfo.universityId', operator: '==', value: universityId },
          { field: 'settings.isActive', operator: '==', value: true }
        ],
        orderBy: [{ field: 'basicInfo.name', direction: 'asc' }],
        limit: 100
      },
      callback,
      errorCallback
    );
  }
}

// Export singleton instance
export const programService = new ProgramService();
