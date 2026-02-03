/**
 * ApplicationService - Service for study abroad application operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { Application, IApplication } from '../../models/Application.js';

export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'waitlisted' | 'withdrawn';
export type ApplicationPriority = 'low' | 'medium' | 'high' | 'urgent';

export class ApplicationService extends BaseService<IApplication, Application> {
  protected modelClass = Application;

  constructor() {
    super('applications');
  }

  /**
   * Get all applications for a specific user with pagination
   */
  async getUserApplications(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: ApplicationStatus;
    } = {}
  ): Promise<PaginatedResult<Application>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'applicant.userId', operator: '==', value: userId }],
      orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
      limit: options.limit || 20,
      startAfter: options.startAfter
    };

    if (options.status) {
      queryOptions.where!.push({
        field: 'workflow.status',
        operator: '==',
        value: options.status
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get applications by status with pagination (admin)
   */
  async getApplicationsByStatus(
    status: ApplicationStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<Application>> {
    return this.findPaginated({
      where: [{ field: 'workflow.status', operator: '==', value: status }],
      orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get applications by priority with pagination (admin)
   */
  async getApplicationsByPriority(
    priority: ApplicationPriority,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<Application>> {
    return this.findPaginated({
      where: [{ field: 'workflow.priority', operator: '==', value: priority }],
      orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get applications assigned to a specific admin
   */
  async getAssignedApplications(
    adminId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: ApplicationStatus;
    } = {}
  ): Promise<PaginatedResult<Application>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'workflow.assignedTo', operator: '==', value: adminId }],
      orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (options.status) {
      queryOptions.where!.push({
        field: 'workflow.status',
        operator: '==',
        value: options.status
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get applications for a specific university
   */
  async getUniversityApplications(
    universityId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: ApplicationStatus;
    } = {}
  ): Promise<PaginatedResult<Application>> {
    const queryOptions: QueryOptions = {
      where: [{ field: 'university.id', operator: '==', value: universityId }],
      orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    };

    if (options.status) {
      queryOptions.where!.push({
        field: 'workflow.status',
        operator: '==',
        value: options.status
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Get applications by date range
   */
  async getApplicationsByDateRange(
    startDate: string,
    endDate: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: ApplicationStatus;
    } = {}
  ): Promise<PaginatedResult<Application>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'workflow.submittedAt', operator: '>=', value: startDate },
        { field: 'workflow.submittedAt', operator: '<=', value: endDate }
      ],
      orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
      limit: options.limit || 100,
      startAfter: options.startAfter
    };

    if (options.status) {
      queryOptions.where!.push({
        field: 'workflow.status',
        operator: '==',
        value: options.status
      });
    }

    return this.findPaginated(queryOptions);
  }

  /**
   * Submit an application (change from draft to submitted)
   */
  async submitApplication(applicationId: string): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const submittedApplication = application.submit();
    return this.update(applicationId, submittedApplication.toFirestore());
  }

  /**
   * Accept an application
   */
  async acceptApplication(
    applicationId: string,
    notes?: string
  ): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const acceptedApplication = application.accept(notes);
    return this.update(applicationId, acceptedApplication.toFirestore());
  }

  /**
   * Reject an application
   */
  async rejectApplication(
    applicationId: string,
    reason: string
  ): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const rejectedApplication = application.reject(reason);
    return this.update(applicationId, rejectedApplication.toFirestore());
  }

  /**
   * Waitlist an application
   */
  async waitlistApplication(
    applicationId: string,
    notes?: string
  ): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const waitlistedApplication = application.waitlist(notes);
    return this.update(applicationId, waitlistedApplication.toFirestore());
  }

  /**
   * Withdraw an application
   */
  async withdrawApplication(
    applicationId: string,
    reason?: string
  ): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    return this.update(applicationId, {
      workflow: {
        ...application.workflow,
        status: 'withdrawn',
        notes: reason || application.workflow.notes
      }
    });
  }

  /**
   * Assign application to an admin
   */
  async assignToAdmin(
    applicationId: string,
    adminId: string
  ): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const assignedApplication = application.assignTo(adminId);
    return this.update(applicationId, assignedApplication.toFirestore());
  }

  /**
   * Update application priority
   */
  async updatePriority(
    applicationId: string,
    priority: ApplicationPriority
  ): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const updatedApplication = application.setPriority(priority);
    return this.update(applicationId, updatedApplication.toFirestore());
  }

  /**
   * Mark document as verified
   */
  async verifyDocument(
    applicationId: string,
    documentType: string,
    verifiedBy: string
  ): Promise<Application> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    const updatedApplication = application.markDocumentVerified(documentType, verifiedBy);
    return this.update(applicationId, updatedApplication.toFirestore());
  }

  /**
   * Get application statistics (admin)
   */
  async getStatistics(dateRange?: { start: string; end: string }): Promise<{
    total: number;
    draft: number;
    submitted: number;
    underReview: number;
    accepted: number;
    rejected: number;
    waitlisted: number;
    withdrawn: number;
    acceptanceRate: number;
  }> {
    const queryOptions: QueryOptions = {};

    if (dateRange) {
      queryOptions.where = [
        { field: 'workflow.submittedAt', operator: '>=', value: dateRange.start },
        { field: 'workflow.submittedAt', operator: '<=', value: dateRange.end }
      ];
    }

    const applications = await this.findAll(queryOptions);

    const total = applications.length;
    const draft = applications.filter(a => a.workflow.status === 'draft').length;
    const submitted = applications.filter(a => a.workflow.status === 'submitted').length;
    const underReview = applications.filter(a => a.workflow.status === 'under_review').length;
    const accepted = applications.filter(a => a.workflow.status === 'accepted').length;
    const rejected = applications.filter(a => a.workflow.status === 'rejected').length;
    const waitlisted = applications.filter(a => a.workflow.status === 'waitlisted').length;
    const withdrawn = applications.filter(a => a.workflow.status === 'withdrawn').length;

    const processed = accepted + rejected;
    const acceptanceRate = processed > 0 ? (accepted / processed) * 100 : 0;

    return {
      total,
      draft,
      submitted,
      underReview,
      accepted,
      rejected,
      waitlisted,
      withdrawn,
      acceptanceRate
    };
  }

  /**
   * Get popular universities (by application count)
   */
  async getPopularUniversities(limit: number = 10): Promise<Array<{
    universityId: string;
    universityName: string;
    count: number;
  }>> {
    const applications = await this.findAll({
      where: [
        { field: 'workflow.status', operator: 'in', value: ['submitted', 'under_review', 'accepted'] }
      ]
    });

    // Count applications by university
    const universityCounts = new Map<string, { id: string; name: string; count: number }>();

    for (const application of applications) {
      const uniId = application.university.id;
      const existing = universityCounts.get(uniId);

      if (existing) {
        existing.count++;
      } else {
        universityCounts.set(uniId, {
          id: uniId,
          name: application.university.name,
          count: 1
        });
      }
    }

    // Convert to array and sort
    return Array.from(universityCounts.values())
      .map(({ id, name, count }) => ({
        universityId: id,
        universityName: name,
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Subscribe to real-time updates for user applications
   */
  subscribeToUserApplications(
    userId: string,
    callback: (applications: Application[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.onSnapshotQuery(
      {
        where: [{ field: 'applicant.userId', operator: '==', value: userId }],
        orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
        limit: 50
      },
      callback,
      errorCallback
    );
  }

  /**
   * Subscribe to real-time updates for assigned applications (admin)
   */
  subscribeToAssignedApplications(
    adminId: string,
    callback: (applications: Application[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.onSnapshotQuery(
      {
        where: [{ field: 'workflow.assignedTo', operator: '==', value: adminId }],
        orderBy: [{ field: 'workflow.submittedAt', direction: 'desc' }],
        limit: 100
      },
      callback,
      errorCallback
    );
  }
}

// Export singleton instance
export const applicationService = new ApplicationService();
