import { AutomationTriggerType } from './enums';
import { ReplenishmentFilter, ReplenishmentSummary } from './replenishment.model';

/** وضعیت پنل اتوماسیون سفارش‌دهی */
export interface AutomationStatus {
  isEnabled: boolean;
  statusName: string;
  triggerType: AutomationTriggerType;
  triggerTypeName: string;
  dailyRunHour: number;
  lastRunAt?: string | null;
  lastRunId?: number | null;
  nextRunAt?: string | null;
  lastRunSummary?: ReplenishmentSummary | null;
}

/** ورودی تغییر تنظیمات اتوماسیون */
export interface UpdateAutomationSettings {
  isEnabled: boolean;
  triggerType: AutomationTriggerType;
  dailyRunHour: number;
}

/** ورودی اجرای اتوماسیون */
export interface RunAutomation {
  triggerType: AutomationTriggerType;
  filter?: ReplenishmentFilter | null;
}

/** یک رویداد تاریخچه اجرا */
export interface AutomationAuditLog {
  id: number;
  automationRunId: number;
  productId?: number | null;
  productName?: string | null;
  productCode?: string | null;
  warehouseId?: number | null;
  warehouseName?: string | null;
  eventType: number;
  eventTypeName: string;
  message: string;
  beforeValue?: string | null;
  afterValue?: string | null;
  createdAt: string;
}
