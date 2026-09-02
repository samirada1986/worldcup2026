import {
  AutomationRunStatus,
  AutomationTriggerType,
  ComparisonParameter,
  OrderingMethod,
  RecommendationStatus
} from './enums';

/** فیلتر صفحه «سفارش‌دهی کالا» */
export interface ReplenishmentFilter {
  fromDate?: string | null;
  toDate?: string | null;
  productId?: number | null;
  warehouseId?: number | null;
  siteId?: number | null;
  productGroupId?: number | null;
  productNatureId?: number | null;
  parameterScopeId?: number | null;
  comparisonParameter?: ComparisonParameter | null;
  surplusPercentage?: number | null;
  triggerType?: AutomationTriggerType;
}

/** یک ردیف نتیجه در گرید سفارش‌دهی کالا */
export interface ReplenishmentRecommendation {
  id: number;
  automationRunId: number;

  productId: number;
  productName: string;
  productCode: string;

  warehouseId: number;
  warehouseName: string;

  siteId: number;
  siteName: string;

  unitOfMeasureId: number;
  unitOfMeasureName: string;

  onHandQuantity: number;
  reservedQuantity: number;
  confirmedIncomingQuantity: number;
  existingOpenRequestQuantity: number;
  effectiveStock: number;
  averageDailyConsumption: number;

  reorderPoint?: number | null;
  minimumStock?: number | null;
  maximumStock?: number | null;

  orderingMethod?: OrderingMethod | null;
  orderingMethodName?: string | null;

  suggestedQuantity: number;
  /** مقدار درخواست — قابل ویرایش در گرید پیش از ارسال */
  requestedQuantity: number;

  requestClassificationId?: number | null;
  requestClassificationName?: string | null;

  reason: string;
  reasonCode: string;

  status: RecommendationStatus;
  statusName: string;

  /** فقط ردیف‌های قابل انتخاب اجازه ایجاد درخواست خرید دارند */
  isSelectable: boolean;

  purchaseRequestId?: number | null;
  purchaseRequestNumber?: string | null;
}

/** خلاصه یک اجرا */
export interface ReplenishmentSummary {
  automationRunId: number;
  startedAt: string;
  finishedAt?: string | null;
  triggerType: AutomationTriggerType;
  triggerTypeName: string;
  status: AutomationRunStatus;
  statusName: string;
  totalItems: number;
  recommendedItems: number;
  reviewItems: number;
  skippedItems: number;
  errorItems: number;
  durationMs: number;
}

/** پاسخ محاسبه نیاز سفارش */
export interface ReplenishmentResult {
  summary: ReplenishmentSummary;
  recommendations: ReplenishmentRecommendation[];
}
