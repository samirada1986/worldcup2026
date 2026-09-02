import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { apiInterceptor } from '../interceptors/api.interceptor';
import { PurchaseRequestService } from './purchase-request.service';

describe('PurchaseRequestService', () => {
  let service: PurchaseRequestService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PurchaseRequestService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('کلید یکتاسازی را هم در بدنه و هم در هدر ارسال می‌کند', () => {
    const payload = {
      idempotencyKey: 'KEY-1',
      automationRunId: 7,
      lines: [{ recommendationId: 1, requestedQuantity: 650 }]
    };

    service.createDraft(payload).subscribe();

    const request = http.expectOne('/api/purchase-requests/draft');
    expect(request.request.headers.get('Idempotency-Key')).toBe('KEY-1');
    expect(request.request.body.idempotencyKey).toBe('KEY-1');
  });

  it('برای هر عملیات کلید یکتاسازی متفاوتی می‌سازد', () => {
    const first = service.newIdempotencyKey();
    const second = service.newIdempotencyKey();

    expect(first).toBeTruthy();
    expect(first).not.toBe(second);
  });

  it('ارسال به گردش‌کار را روی مسیر درست فراخوانی می‌کند', () => {
    service.submit(12).subscribe();

    const request = http.expectOne('/api/purchase-requests/12/submit');
    expect(request.request.method).toBe('POST');
    request.flush({ success: true, data: { id: 12, statusName: 'ارسال‌شده' } });
  });
});
