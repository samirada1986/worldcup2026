/**
 * مقادیر ثابت مشترک با بک‌اند.
 * مقادیر عددی دقیقاً با enumهای سمت سرور یکسان هستند.
 */

/** نحوه سفارش‌دهی */
export enum OrderingMethod {
  ReorderPoint = 1,
  MinMax = 2,
  DesiredLevel = 3,
  ConsumptionBased = 4
}

/** وضعیت پیشنهاد سفارش */
export enum RecommendationStatus {
  NeedsOrder = 1,
  NeedsReview = 2,
  OpenRequestExists = 3,
  NoNeed = 4,
  ConfigurationError = 5,
  DraftCreated = 6
}

/** وضعیت درخواست خرید */
export enum PurchaseRequestStatus {
  Draft = 1,
  Submitted = 2,
  InProgress = 3,
  Approved = 4,
  Rejected = 5,
  Cancelled = 6,
  Closed = 7
}

/** منبع ایجاد درخواست خرید */
export enum PurchaseRequestSource {
  Manual = 1,
  Automation = 2
}

/** نوع اجرای اتوماسیون */
export enum AutomationTriggerType {
  Manual = 1,
  DailySchedule = 2
}

/** وضعیت اجرای اتوماسیون */
export enum AutomationRunStatus {
  Running = 1,
  Completed = 2,
  Failed = 3
}

/** پارامتر مقایسه موجودی در فیلتر صفحه سفارش‌دهی */
export enum ComparisonParameter {
  ReorderPoint = 1,
  MinimumStock = 2,
  MaximumStock = 3,
  DesiredStockLevel = 4
}

/** وضعیت گردش‌کار */
export enum WorkflowStatus {
  NotStarted = 0,
  Started = 1,
  InReview = 2,
  Completed = 3
}

/**
 * کلاس CSS نشانگر وضعیت پیشنهاد.
 * نگاشت وضعیت به ظاهر، تنها تصمیم نمایشی سمت فرانت‌اند است.
 */
export const RECOMMENDATION_STATUS_CLASS: Record<RecommendationStatus, string> = {
  [RecommendationStatus.NeedsOrder]: 'gng-badge--needs-order',
  [RecommendationStatus.NeedsReview]: 'gng-badge--needs-review',
  [RecommendationStatus.OpenRequestExists]: 'gng-badge--open-request',
  [RecommendationStatus.NoNeed]: 'gng-badge--no-need',
  [RecommendationStatus.ConfigurationError]: 'gng-badge--error',
  [RecommendationStatus.DraftCreated]: 'gng-badge--draft-created'
};

/** کلاس CSS نشانگر وضعیت درخواست خرید */
export const PURCHASE_REQUEST_STATUS_CLASS: Record<PurchaseRequestStatus, string> = {
  [PurchaseRequestStatus.Draft]: 'gng-badge--no-need',
  [PurchaseRequestStatus.Submitted]: 'gng-badge--open-request',
  [PurchaseRequestStatus.InProgress]: 'gng-badge--needs-review',
  [PurchaseRequestStatus.Approved]: 'gng-badge--draft-created',
  [PurchaseRequestStatus.Rejected]: 'gng-badge--error',
  [PurchaseRequestStatus.Cancelled]: 'gng-badge--error',
  [PurchaseRequestStatus.Closed]: 'gng-badge--no-need'
};
