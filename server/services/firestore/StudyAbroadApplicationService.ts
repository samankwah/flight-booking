/**
 * StudyAbroadApplicationService - Service for legacy study abroad applications
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { StudyAbroadApplication, IStudyAbroadApplication } from '../../models/StudyAbroadApplication.js';

export type LegacyApplicationStatus = 'inquiry' | 'consulting' | 'applying' | 'admitted' | 'enrolled' | 'cancelled';

export class StudyAbroadApplicationService extends BaseService<IStudyAbroadApplication, StudyAbroadApplication> {
  protected modelClass = StudyAbroadApplication;

  constructor() {
    super('studyAbroadApplications');
  }

  /**
   * Get all applications for a specific user
   */
  async getUserApplications(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: LegacyApplicationStatus;
    } = {}
  ): Promise<PaginatedResult<StudyAbroadApplication>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: [{ field: 'submittedAt', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    };

    if (options.status) {
      queryOptions.where!.push({
        field: 'status',
        operator: '==',
        value: options.status
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get applications by status
   */
  async getApplicationsByStatus(
    status: LegacyApplicationStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<StudyAbroadApplication>> {
    return this.findPaginated({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'submittedAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Assign consultant to application
   */
  async assignConsultant(
    applicationId: string,
    consultantId: string
  ): Promise<StudyAbroadApplication> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const assigned = application.assignConsultant(consultantId);
    return this.update(applicationId, assigned.toFirestore());
  }

  /**
   * Get applications assigned to a consultant
   */
  async getConsultantApplications(
    consultantId: string,
    options: {
      limit?: number;
      status?: LegacyApplicationStatus;
    } = {}
  ): Promise<StudyAbroadApplication[]> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'assignedConsultant', operator: '==', value: consultantId }
      ],
      orderBy: [{ field: 'submittedAt', direction: 'desc' }],
      limit: options.limit || 100
    };

    if (options.status) {
      queryOptions.where!.push({
        field: 'status',
        operator: '==',
        value: options.status
      });
    }

    return this.findAll(queryOptions);
  }
}

// Export singleton instance
export const studyAbroadApplicationService = new StudyAbroadApplicationService();
