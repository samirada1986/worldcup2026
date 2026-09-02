import { PurchaseRequestSource, PurchaseRequestStatus, WorkflowStatus } from './enums';

/** ورودی ایجاد پیش‌نویس درخواست خرید */
export interface CreateDraftPurchaseRequest {
  /** کلید یکتاسازی — از ایجاد پیش‌نویس تکراری جلوگیری می‌کند */
  idempotencyKey: string;
  automationRunId: number;
  lines: DraftPurchaseRequestLine[];
}

/** یک ردیف انتخاب‌شده برای ایجاد پیش‌نویس */
export interface DraftPurchaseRequestLine {
  recommendationId: number;
  requestedQuantity: number;
  requestClassificationId?: number | null;
  /** دلیل تغییر مقدار پیشنهادی — در انحراف بیش از ۲۰٪ الزامی است */
  quantityChangeReason?: string | null;
}

/** درخواست خرید */
export interface PurchaseRequest {
  id: number;
  requestNumber: string;
  status: PurchaseRequestStatus;
  statusName: string;
  createdAt: string;
  submittedAt?: string | null;
  createdBy: string;
  source: PurchaseRequestSource;
  sourceName: string;
  automationRunId?: number | null;
  workflowStatus: WorkflowStatus;
  workflowStatusName: string;
  workflowInstanceId?: string | null;
  items: PurchaseRequestItem[];
  skippedLines: SkippedLine[];
  isExisting: boolean;
}

/** ردیف درخواست خرید */
export interface PurchaseRequestItem {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  warehouseId: number;
  warehouseName: string;
  siteId: number;
  siteName: string;
  requestedQuantity: number;
  suggestedQuantity: number;
  unitOfMeasureId: number;
  unitOfMeasureName: string;
  requestClassificationId?: number | null;
  requestClassificationName?: string | null;
  quantityChangeReason?: string | null;
}

/** ردیف کنارگذاشته‌شده به همراه دلیل */
export interface SkippedLine {
  recommendationId: number;
  productId: number;
  productName: string;
  code: string;
  reason: string;
}
