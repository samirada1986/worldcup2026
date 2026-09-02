import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { apiInterceptor } from '../interceptors/api.interceptor';
import { ApiError, AutomationTriggerType, RecommendationStatus } from '../models';
import { ReplenishmentService } from './replenishment.service';

describe('ReplenishmentService', () => {
  let service: ReplenishmentService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ReplenishmentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('پوشش استاندارد پاسخ را باز می‌کند و فقط داده را برمی‌گرداند', () => {
    const payload = {
      summary: { automationRunId: 7, totalItems: 22, recommendedItems: 10 },
      recommendations: [
        { id: 1, productCode: 'KLA-1001', suggestedQuantity: 650, status: RecommendationStatus.NeedsOrder }
      ]
    };

    let received: unknown;
    service.calculate({ triggerType: AutomationTriggerType.Manual }).subscribe(r => (received = r));

    const request = http.expectOne('/api/replenishment/calculate');
    expect(request.request.method).toBe('POST');
    request.flush({ success: true, data: payload });

    expect(received).toEqual(payload as never);
  });

  it('فیلتر را بدون تغییر به بک‌اند ارسال می‌کند', () => {
    const filter = {
      productId: 3,
      warehouseId: 1,
      surplusPercentage: 20,
      triggerType: AutomationTriggerType.Manual
    };

    service.calculate(filter).subscribe();

    const request = http.expectOne('/api/replenishment/calculate');
    expect(request.request.body).toEqual(filter);
  });

  it('خطای بک‌اند را به ApiError با پیام فارسی تبدیل می‌کند', () => {
    let error: unknown;
    service.calculate({}).subscribe({ error: e => (error = e) });

    http.expectOne('/api/replenishment/calculate').flush(
      {
        success: false,
        code: 'INVALID_REPLENISHMENT_PARAMETER',
        message: 'حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.',
        details: { maximumStock: 'مقدار نامعتبر است.' }
      },
      { status: 400, statusText: 'Bad Request' }
    );

    expect(error).toBeInstanceOf(ApiError);
    const apiError = error as ApiError;
    expect(apiError.code).toBe('INVALID_REPLENISHMENT_PARAMETER');
    expect(apiError.message).toBe('حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.');
    expect(apiError.fieldErrors['maximumStock']).toBe('مقدار نامعتبر است.');
  });

  it('قطع ارتباط با سرور را با پیام قابل فهم گزارش می‌کند', () => {
    let error: unknown;
    service.calculate({}).subscribe({ error: e => (error = e) });

    http.expectOne('/api/replenishment/calculate')
      .error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });

    expect((error as ApiError).code).toBe('NETWORK_ERROR');
    expect((error as ApiError).message).toContain('ارتباط با سرور');
  });

  it('استثنای خام سرور را به کامپوننت‌ها منتقل نمی‌کند', () => {
    let error: unknown;
    service.calculate({}).subscribe({ error: e => (error = e) });

    http.expectOne('/api/replenishment/calculate')
      .flush('<html>Unhandled exception</html>', { status: 500, statusText: 'Server Error' });

    expect(error).toBeInstanceOf(ApiError);
    expect(error).not.toBeInstanceOf(HttpErrorResponse);
    expect((error as ApiError).message).toContain('500');
  });
});
