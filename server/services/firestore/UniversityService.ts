/**
 * UniversityService - Service for university operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { University, IUniversity } from '../../models/University.js';

export class UniversityService extends BaseService<IUniversity, University> {
  protected modelClass = University;

  constructor() {
    super('universities');
  }

  /**
   * Get all active universities with pagination
   */
  async getActiveUniversities(
    options: {
      limit?: number;
      startAfter?: any;
      country?: string;
      featured?: boolean;
    } = {}
  ): Promise<PaginatedResult<University>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'settings.isActive', operator: '==', value: true }],
      orderBy: [{ field: 'settings.createdAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (options.country) {
      queryOptions.where!.push({
        field: 'basicInfo.country',
        operator: '==',
        value: options.country
      });
    }

    if (options.featured !== undefined) {
      queryOptions.where!.push({
        field: 'settings.isFeatured',
        operator: '==',
        value: options.featured
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get featured universities
   */
  async getFeaturedUniversities(
    options: {
      limit?: number;
      country?: string;
    } = {}
  ): Promise<University[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'settings.isActive', operator: '==', value: true },
        { field: 'settings.isFeatured', operator: '==', value: true }
      ],
      orderBy: [{ field: 'settings.createdAt', direction: 'desc' }],
      limit: options.limit || 20
    };

    if (options.country) {
      queryOptions.where!.push({
        field: 'basicInfo.country',
        operator: '==',
        value: options.country
      });
    }

    return this.findAll(queryOptions);
  }

  /**
   * Get universities by country
   */
  async getByCountry(
    country: string,
    options: {
      limit?: number;
      startAfter?: any;
      activeOnly?: boolean;
    } = {}
  ): Promise<PaginatedResult<University>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'basicInfo.country', operator: '==', value: country }
      ],
      orderBy: [{ field: 'basicInfo.name', direction: 'asc' }],
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
   * Search universities by name (client-side filtering for flexibility)
   */
  async searchByName(
    searchTerm: string,
    options: {
      limit?: number;
      country?: string;
      activeOnly?: boolean;
    } = {}
  ): Promise<University[]> {
    const queryOptions: QueryOptions = {
      limit: options.limit || 100
    };

    const where: QueryOptions['where'] = [];

    if (options.country) {
      where.push({
        field: 'basicInfo.country',
        operator: '==',
        value: options.country
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

    const universities = await this.findAll(queryOptions);

    // Client-side filtering for flexible name search
    const searchLower = searchTerm.toLowerCase();
    return universities.filter(uni =>
      uni.basicInfo.name.toLowerCase().includes(searchLower) ||
      (uni.basicInfo.shortName && uni.basicInfo.shortName.toLowerCase().includes(searchLower))
    );
  }

  /**
   * Get university by slug
   */
  async getBySlug(slug: string): Promise<University | null> {
    return this.findOne({
      where: [
        { field: 'basicInfo.slug', operator: '==', value: slug }
      ]
    });
  }

  /**
   * Toggle university featured status
   */
  async toggleFeatured(universityId: string): Promise<University> {
    const university = await this.findById(universityId);
    if (!university) {
      throw new Error('University not found');
    }

    const updatedUniversity = university.toggleFeatured();
    return this.update(universityId, updatedUniversity.toFirestore());
  }

  /**
   * Toggle university active status
   */
  async toggleActive(universityId: string): Promise<University> {
    const university = await this.findById(universityId);
    if (!university) {
      throw new Error('University not found');
    }

    const updatedUniversity = university.toggleActive();
    return this.update(universityId, updatedUniversity.toFirestore());
  }

  /**
   * Increment application count
   */
  async incrementApplicationCount(universityId: string): Promise<University> {
    const university = await this.findById(universityId);
    if (!university) {
      throw new Error('University not found');
    }

    const updatedUniversity = university.incrementApplicationCount();
    return this.update(universityId, updatedUniversity.toFirestore());
  }

  /**
   * Update rankings
   */
  async updateRankings(
    universityId: string,
    rankings: IUniversity['academics']['rankings']
  ): Promise<University> {
    return this.update(universityId, {
      academics: {
        rankings
      }
    } as Partial<IUniversity>);
  }

  /**
   * Get university statistics (admin)
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    inactive: number;
    featured: number;
    byCountry: Record<string, number>;
  }> {
    const universities = await this.findAll();

    const byCountry: Record<string, number> = {};

    for (const uni of universities) {
      const country = uni.basicInfo.country;
      byCountry[country] = (byCountry[country] || 0) + 1;
    }

    return {
      total: universities.length,
      active: universities.filter(u => u.settings.isActive).length,
      inactive: universities.filter(u => !u.settings.isActive).length,
      featured: universities.filter(u => u.settings.isFeatured).length,
      byCountry
    };
  }

  /**
   * Get universities with highest application counts
   */
  async getTopUniversitiesByApplications(limit: number = 10): Promise<University[]> {
    const universities = await this.findAll({
      where: [
        { field: 'settings.isActive', operator: '==', value: true }
      ]
    });

    // Sort by application count
    return universities
      .sort((a, b) => (b.settings.applicationCount || 0) - (a.settings.applicationCount || 0))
      .slice(0, limit);
  }

  /**
   * Subscribe to real-time updates for universities
   */
  subscribeToActiveUniversities(
    callback: (universities: University[]) => void,
    errorCallback?: (error: Error) => void,
    options: {
      country?: string;
      featured?: boolean;
    } = {}
  ): () => void {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'settings.isActive', operator: '==', value: true }
      ],
      orderBy: [{ field: 'basicInfo.name', direction: 'asc' }],
      limit: 100
    };

    if (options.country) {
      queryOptions.where!.push({
        field: 'basicInfo.country',
        operator: '==',
        value: options.country
      });
    }

    if (options.featured !== undefined) {
      queryOptions.where!.push({
        field: 'settings.isFeatured',
        operator: '==',
        value: options.featured
      });
    }

    return this.onSnapshotQuery(queryOptions, callback, errorCallback);
  }
}

// Export singleton instance
export const universityService = new UniversityService();
