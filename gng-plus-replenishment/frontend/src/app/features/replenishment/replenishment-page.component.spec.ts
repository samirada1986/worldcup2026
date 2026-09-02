import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { apiInterceptor } from '../../core/interceptors/api.interceptor';
import { AutomationRunStatus, AutomationTriggerType, RecommendationStatus } from '../../core/models';
import { ReplenishmentPageComponent } from './replenishment-page.component';

/** پاسخ نمونه محاسبه — همان قالبی که بک‌اند برمی‌گرداند */
const CALCULATION_RESULT = {
  summary: {
    automationRunId: 7,
    startedAt: '2026-09-01T08:00:00Z',
    finishedAt: '2026-09-01T08:00:01Z',
    triggerType: AutomationTriggerType.Manual,
    triggerTypeName: 'دستی',
    status: AutomationRunStatus.Completed,
    statusName: 'خاتمه یافته',
    totalItems: 4,
    recommendedItems: 1,
    reviewItems: 1,
    skippedItems: 1,
    errorItems: 1,
    durationMs: 23
  },
  recommendations: [
    {
      id: 1, automationRunId: 7, productId: 1, productName: 'کاغذ A4', productCode: 'KLA-1001',
      warehouseId: 2, warehouseName: 'انبار اداری', siteId: 1, siteName: 'سایت مرکزی تهران',
      unitOfMeasureId: 1, unitOfMeasureName: 'بسته',
      onHandQuantity: 180, reservedQuantity: 30, confirmedIncomingQuantity: 0,
      existingOpenRequestQuantity: 0, effectiveStock: 150, averageDailyConsumption: 12,
      reorderPoint: 200, minimumStock: 150, maximumStock: 1000,
      suggestedQuantity: 650, requestedQuantity: 650,
      reason: 'موجودی موثر (150) به نقطه سفارش (200) رسیده است؛ جبران تا سطح هدف (800).',
      reasonCode: 'BELOW_REORDER_POINT',
      status: RecommendationStatus.NeedsOrder, statusName: 'نیازمند سفارش', isSelectable: true
    },
    {
      id: 2, automationRunId: 7, productId: 9, productName: 'مواد شوینده', productCode: 'KLA-1009',
      warehouseId: 1, warehouseName: 'انبار مرکزی', siteId: 1, siteName: 'سایت مرکزی تهران',
      unitOfMeasureId: 5, unitOfMeasureName: 'لیتر',
      onHandQuantity: 120, reservedQuantity: 20, confirmedIncomingQuantity: 0,
      existingOpenRequestQuantity: 0, effectiveStock: 100, averageDailyConsumption: 9,
      suggestedQuantity: 1400, requestedQuantity: 1400,
      reason: 'مقدار پیشنهادی از مقدار حداکثر سفارش بیشتر است و نیازمند بررسی کاربر است.',
      reasonCode: 'SUGGESTED_ABOVE_MAXIMUM_ORDER_QUANTITY',
      status: RecommendationStatus.NeedsReview, statusName: 'نیازمند بررسی', isSelectable: true
    },
    {
      id: 3, automationRunId: 7, productId: 5, productName: 'روغن صنعتی', productCode: 'KLA-1005',
      warehouseId: 1, warehouseName: 'انبار مرکزی', siteId: 1, siteName: 'سایت مرکزی تهران',
      unitOfMeasureId: 5, unitOfMeasureName: 'لیتر',
      onHandQuantity: 250, reservedQuantity: 0, confirmedIncomingQuantity: 0,
      existingOpenRequestQuantity: 700, effectiveStock: -450, averageDailyConsumption: 6,
      suggestedQuantity: 0, requestedQuantity: 0,
      reason: 'برای این کالا درخواست خرید باز وجود دارد.',
      reasonCode: 'OPEN_PURCHASE_REQUEST_EXISTS',
      status: RecommendationStatus.OpenRequestExists, statusName: 'درخواست باز موجود است',
      isSelectable: false
    },
    {
      id: 4, automationRunId: 7, productId: 6, productName: 'پیچ صنعتی', productCode: 'KLA-1006',
      warehouseId: 3, warehouseName: 'انبار قطعات تولید', siteId: 2, siteName: 'سایت تولید کاشان',
      unitOfMeasureId: 2, unitOfMeasureName: 'عدد',
      onHandQuantity: 300, reservedQuantity: 0, confirmedIncomingQuantity: 0,
      existingOpenRequestQuantity: 0, effectiveStock: 0, averageDailyConsumption: 0,
      suggestedQuantity: 0, requestedQuantity: 0,
      reason: 'حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.',
      reasonCode: 'INVALID_MIN_MAX_CONFIGURATION',
      status: RecommendationStatus.ConfigurationError, statusName: 'خطای تنظیمات', isSelectable: false
    }
  ]
};

describe('ReplenishmentPageComponent', () => {
  let fixture: ComponentFixture<ReplenishmentPageComponent>;
  let component: ReplenishmentPageComponent;
  let http: HttpTestingController;

  /** پاسخ دادن به فراخوانی محاسبه‌ای که در سازنده انجام می‌شود */
  function flushCalculation(): void {
    http.expectOne('/api/replenishment/calculate').flush({ success: true, data: CALCULATION_RESULT });
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplenishmentPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReplenishmentPageComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    // فراخوانی‌های لیست‌های انتخابی به نتیجه آزمون ارتباطی ندارند
    http.match(request => request.url.startsWith('/api/lookups/')).forEach(r => r.flush({ success: true, data: [] }));
  });

  it('نتیجه محاسبه بک‌اند را در گرید قرار می‌دهد', () => {
    flushCalculation();

    expect(component.rows().length).toBe(4);
    expect(component.summary()?.totalItems).toBe(4);
    expect(component.summary()?.recommendedItems).toBe(1);
  });

  it('مقدار پیشنهادی را همان‌طور که بک‌اند داده نمایش می‌دهد و بازمحاسبه نمی‌کند', () => {
    flushCalculation();

    const row = component.rows().find(r => r.productCode === 'KLA-1001')!;
    expect(row.suggestedQuantity).toBe(650);
    expect(row.effectiveStock).toBe(150);
  });

  it('برای هر وضعیت، کلاس ظاهری متناظر را برمی‌گرداند', () => {
    expect(component.statusVariant(RecommendationStatus.NeedsOrder)).toBe('gng-badge--needs-order');
    expect(component.statusVariant(RecommendationStatus.NeedsReview)).toBe('gng-badge--needs-review');
    expect(component.statusVariant(RecommendationStatus.OpenRequestExists)).toBe('gng-badge--open-request');
    expect(component.statusVariant(RecommendationStatus.ConfigurationError)).toBe('gng-badge--error');
  });

  it('ردیف‌های دارای درخواست باز یا خطای تنظیمات قابل انتخاب نیستند', () => {
    flushCalculation();

    const rows = component.rows();
    expect(component.isRowSelectable(rows[0])).toBeTrue();
    expect(component.isRowSelectable(rows[1])).toBeTrue();
    expect(component.isRowSelectable(rows[2])).toBeFalse();
    expect(component.isRowSelectable(rows[3])).toBeFalse();
  });

  it('دکمه ارسال درخواست خرید پیش از انتخاب ردیف غیرفعال است', () => {
    flushCalculation();

    expect(component.canSend).toBeFalse();

    component.onSelectionChanged([1]);
    expect(component.canSend).toBeTrue();
  });

  it('ردیف‌های غیرقابل انتخاب را از انتخاب کنار می‌گذارد', () => {
    flushCalculation();

    component.onSelectionChanged([1, 3, 4]);

    expect(component.selectedKeys()).toEqual([1]);
    expect(component.selectedRows.map(r => r.productCode)).toEqual(['KLA-1001']);
  });

  it('فیلتر صفحه را در بدنه درخواست محاسبه ارسال می‌کند', () => {
    flushCalculation();

    component.filter.warehouseId = 2;
    component.filter.surplusPercentage = 20;
    component.search();

    const request = http.expectOne('/api/replenishment/calculate');
    expect(request.request.body.warehouseId).toBe(2);
    expect(request.request.body.surplusPercentage).toBe(20);
    request.flush({ success: true, data: CALCULATION_RESULT });
  });

  it('بازنشانی، فیلترها را خالی و محاسبه را دوباره اجرا می‌کند', () => {
    flushCalculation();

    component.filter.warehouseId = 2;
    component.reset();

    expect(component.filter.warehouseId).toBeNull();
    const request = http.expectOne('/api/replenishment/calculate');
    request.flush({ success: true, data: CALCULATION_RESULT });
  });

  it('در صورت خطای بک‌اند، گرید خالی می‌شود و صفحه از کار نمی‌افتد', () => {
    flushCalculation();

    component.calculate();
    http.expectOne('/api/replenishment/calculate').flush(
      { success: false, code: 'INTERNAL_SERVER_ERROR', message: 'خطای غیرمنتظره', details: {} },
      { status: 500, statusText: 'Server Error' }
    );
    fixture.detectChanges();

    expect(component.rows()).toEqual([]);
    expect(component.summary()).toBeNull();
    expect(component.calculating()).toBeFalse();
  });

  it('تاریخ انتخاب‌شده را به قالب ISO بدون بخش زمان تبدیل می‌کند', () => {
    expect(component.toIsoDate(new Date(2026, 8, 1))).toBe('2026-09-01T00:00:00');
    expect(component.toIsoDate(null)).toBeNull();
  });
});
