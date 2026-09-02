import { OrderingMethod } from './enums';

/** پارامتر سفارش‌دهی کالا */
export interface InventoryOrderParameter {
  id: number;

  productId: number;
  productName?: string | null;
  productCode?: string | null;

  warehouseId: number;
  warehouseName?: string | null;

  siteId: number;
  siteName?: string | null;

  parameterScopeId: number;
  parameterScopeName?: string | null;

  unitOfMeasureId: number;
  unitOfMeasureName?: string | null;

  requestTypeId: number;
  requestTypeName?: string | null;

  orderingMethod: OrderingMethod;
  orderingMethodName?: string | null;

  defaultRequestClassificationId?: number | null;
  defaultRequestClassificationName?: string | null;

  qualityControlParameterId?: number | null;
  qualityControlParameterName?: string | null;

  testPlanId?: number | null;
  testPlanName?: string | null;

  reorderPoint?: number | null;
  minimumStock?: number | null;
  maximumStock?: number | null;
  desiredStockLevel?: number | null;
  safetyStock?: number | null;
  specialValueCoefficient?: number | null;
  averageConsumptionDays?: number | null;
  minimumCoverageDays?: number | null;
  salesCoverageDays?: number | null;
  minimumOrderQuantity?: number | null;
  maximumOrderQuantity?: number | null;
  orderBatchSize?: number | null;
  economicOrderQuantity?: number | null;
  leadTimeDays?: number | null;

  validFrom: string;
  validTo?: string | null;
  isActive: boolean;
}

/** ورودی ایجاد/ویرایش پارامتر */
export interface InventoryOrderParameterUpsert {
  productId: number | null;
  warehouseId: number | null;
  siteId: number | null;
  parameterScopeId: number | null;
  unitOfMeasureId: number | null;
  requestTypeId: number | null;
  orderingMethod: OrderingMethod | null;
  defaultRequestClassificationId: number | null;
  qualityControlParameterId: number | null;
  testPlanId: number | null;

  reorderPoint: number | null;
  minimumStock: number | null;
  maximumStock: number | null;
  desiredStockLevel: number | null;
  safetyStock: number | null;
  specialValueCoefficient: number | null;
  averageConsumptionDays: number | null;
  minimumCoverageDays: number | null;
  salesCoverageDays: number | null;
  minimumOrderQuantity: number | null;
  maximumOrderQuantity: number | null;
  orderBatchSize: number | null;
  economicOrderQuantity: number | null;
  leadTimeDays: number | null;

  validFrom: Date | string;
  validTo: Date | string | null;
  isActive: boolean;
}

/** فیلتر فهرست پارامترها */
export interface ParameterQuery {
  productId?: number | null;
  warehouseId?: number | null;
  siteId?: number | null;
  isActive?: boolean | null;
  search?: string | null;
}
