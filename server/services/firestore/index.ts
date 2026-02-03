/**
 * Firestore Services Index - Export all services
 */

// Base service and types
export { BaseService, type QueryOptions, type PaginatedResult, type QueryFilter, type OrderBy, type BatchResult } from './BaseService.js';

// Booking services
export { BookingService, bookingService } from './BookingService.js';
export { HotelBookingService, hotelBookingService } from './HotelBookingService.js';
export { HolidayBookingService, holidayBookingService } from './HolidayBookingService.js';

// Application services
export { VisaApplicationService, visaApplicationService, type VisaApplicationStatus } from './VisaApplicationService.js';
export { ApplicationService, applicationService, type ApplicationStatus, type ApplicationPriority } from './ApplicationService.js';
export { StudyAbroadApplicationService, studyAbroadApplicationService, type LegacyApplicationStatus } from './StudyAbroadApplicationService.js';

// University and program services
export { UniversityService, universityService } from './UniversityService.js';
export { ProgramService, programService } from './ProgramService.js';

// User and notification services
export { UserService, userService } from './UserService.js';
export {
  NotificationSubscriptionService,
  NotificationPreferenceService,
  notificationSubscriptionService,
  notificationPreferenceService
} from './NotificationService.js';

// Alert and offer services
export { PriceAlertService, priceAlertService } from './PriceAlertService.js';
export {
  SpecialOfferService,
  TopDealService,
  specialOfferService,
  topDealService
} from './OfferService.js';

// Analytics service
export {
  AnalyticsService,
  analyticsService,
  type DateRange,
  type RevenueStatistics,
  type BookingTrends,
  type PopularRoute,
  type DashboardMetrics
} from './AnalyticsService.js';
