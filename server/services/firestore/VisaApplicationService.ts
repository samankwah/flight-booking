/**
 * VisaApplicationService - Service for visa application operations
 */

import { BaseService, QueryOptions, PaginatedResult } from './BaseService.js';
import { VisaApplication, IVisaApplication } from '../../models/VisaApplication.js';

export type VisaApplicationStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'cancelled';

export class VisaApplicationService extends BaseService<IVisaApplication, VisaApplication> {
  protected modelClass = VisaApplication;

  constructor() {
    super('visaApplications');
  }

  /**
   * Get all visa applications for a specific user with pagination
   */
  async getUserApplications(
    userId: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: VisaApplicationStatus;
    } = {}
  ): Promise<PaginatedResult<VisaApplication>> {
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
   * Get visa applications by status with pagination (admin)
   */
  async getApplicationsByStatus(
    status: VisaApplicationStatus,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<VisaApplication>> {
    return this.findPaginated({
      where: [{ field: 'status', operator: '==', value: status }],
      orderBy: [{ field: 'submittedAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Get pending visa applications (under review)
   */
  async getPendingApplications(
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<VisaApplication>> {
    return this.getApplicationsByStatus('under_review', options);
  }

  /**
   * Get visa applications by date range
   */
  async getApplicationsByDateRange(
    startDate: string,
    endDate: string,
    options: {
      limit?: number;
      startAfter?: any;
      status?: VisaApplicationStatus;
    } = {}
  ): Promise<PaginatedResult<VisaApplication>> {
    const queryOptions: QueryOptions = {
      where: [
        { field: 'submittedAt', operator: '>=', value: startDate },
        { field: 'submittedAt', operator: '<=', value: endDate }
      ],
      orderBy: [{ field: 'submittedAt', direction: 'desc' }],
      limit: options.limit || 100,
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
   * Get visa application by reference number
   */
  async getByReferenceNumber(referenceNumber: string): Promise<VisaApplication | null> {
    return this.findOne({
      where: [
        { field: 'referenceNumber', operator: '==', value: referenceNumber }
      ]
    });
  }

  /**
   * Get visa applications by destination country
   */
  async getByDestinationCountry(
    country: string,
    options: {
      limit?: number;
      startAfter?: any;
    } = {}
  ): Promise<PaginatedResult<VisaApplication>> {
    return this.findPaginated({
      where: [
        { field: 'travelDetails.destinationCountry', operator: '==', value: country }
      ],
      orderBy: [{ field: 'submittedAt', direction: 'desc' }],
      limit: options.limit || 50,
      startAfter: options.startAfter
    });
  }

  /**
   * Approve a visa application
   */
  async approveApplication(
    applicationId: string,
    approvalNotes?: string
  ): Promise<VisaApplication> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Visa application not found');
    }

    const approvedApplication = application.approve(approvalNotes);
    return this.update(applicationId, approvedApplication.toFirestore());
  }

  /**
   * Reject a visa application
   */
  async rejectApplication(
    applicationId: string,
    rejectionReason: string
  ): Promise<VisaApplication> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Visa application not found');
    }

    const rejectedApplication = application.reject(rejectionReason);
    return this.update(applicationId, rejectedApplication.toFirestore());
  }

  /**
   * Submit a visa application (change from draft to submitted)
   */
  async submitApplication(applicationId: string): Promise<VisaApplication> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Visa application not found');
    }

    const submittedApplication = application.submit();
    return this.update(applicationId, submittedApplication.toFirestore());
  }

  /**
   * Cancel a visa application
   */
  async cancelApplication(
    applicationId: string,
    reason?: string
  ): Promise<VisaApplication> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Visa application not found');
    }

    return this.update(applicationId, {
      status: 'cancelled',
      notes: reason
    });
  }

  /**
   * Add document to visa application
   */
  async addDocument(
    applicationId: string,
    document: {
      type: string;
      name: string;
      url: string;
      uploadedAt: string;
    }
  ): Promise<VisaApplication> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Visa application not found');
    }

    const updatedApplication = application.addDocument(document);
    return this.update(applicationId, updatedApplication.toFirestore());
  }

  /**
   * Get visa application statistics (admin)
   */
  async getStatistics(dateRange?: { start: string; end: string }): Promise<{
    total: number;
    submitted: number;
    underReview: number;
    approved: number;
    rejected: number;
    cancelled: number;
    approvalRate: number;
  }> {
    const queryOptions: QueryOptions = {};

    if (dateRange) {
      queryOptions.where = [
        { field: 'submittedAt', operator: '>=', value: dateRange.start },
        { field: 'submittedAt', operator: '<=', value: dateRange.end }
      ];
    }

    const applications = await this.findAll(queryOptions);

    const total = applications.length;
    const submitted = applications.filter(a => a.status === 'submitted').length;
    const underReview = applications.filter(a => a.status === 'under_review').length;
    const approved = applications.filter(a => a.status === 'approved').length;
    const rejected = applications.filter(a => a.status === 'rejected').length;
    const cancelled = applications.filter(a => a.status === 'cancelled').length;

    const processed = approved + rejected;
    const approvalRate = processed > 0 ? (approved / processed) * 100 : 0;

    return {
      total,
      submitted,
      underReview,
      approved,
      rejected,
      cancelled,
      approvalRate
    };
  }

  /**
   * Get popular destination countries
   */
  async getPopularDestinations(limit: number = 10): Promise<Array<{
    country: string;
    count: number;
  }>> {
    const applications = await this.findAll({
      where: [
        { field: 'status', operator: 'in', value: ['submitted', 'under_review', 'approved'] }
      ]
    });

    // Count applications by destination
    const destinationCounts = new Map<string, number>();

    for (const application of applications) {
      const country = application.travelDetails.destinationCountry;
      destinationCounts.set(country, (destinationCounts.get(country) || 0) + 1);
    }

    // Convert to array and sort
    return Array.from(destinationCounts.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Subscribe to real-time updates for user visa applications
   */
  subscribeToUserApplications(
    userId: string,
    callback: (applications: VisaApplication[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.onSnapshotQuery(
      {
        where: [{ field: 'userId', operator: '==', value: userId }],
        orderBy: [{ field: 'submittedAt', direction: 'desc' }],
        limit: 50
      },
      callback,
      errorCallback
    );
  }

  /**
   * Subscribe to real-time updates for pending applications (admin)
   */
  subscribeToPendingApplications(
    callback: (applications: VisaApplication[]) => void,
    errorCallback?: (error: Error) => void
  ): () => void {
    return this.onSnapshotQuery(
      {
        where: [{ field: 'status', operator: '==', value: 'under_review' }],
        orderBy: [{ field: 'submittedAt', direction: 'asc' }],
        limit: 100
      },
      callback,
      errorCallback
    );
  }
}

// Export singleton instance
export const visaApplicationService = new VisaApplicationService();
