import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateDraftPurchaseRequest, PurchaseRequest } from '../models';

/** APIهای درخواست خرید */
@Injectable({ providedIn: 'root' })
export class PurchaseRequestService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/purchase-requests`;

  getAll(): Observable<PurchaseRequest[]> {
    return this.http.get<PurchaseRequest[]>(this.baseUrl);
  }

  get(id: number): Observable<PurchaseRequest> {
    return this.http.get<PurchaseRequest>(`${this.baseUrl}/${id}`);
  }

  /**
   * ایجاد پیش‌نویس درخواست خرید.
   * کلید یکتاسازی در هدر نیز ارسال می‌شود تا ارسال دوباره،
   * درخواست خرید تکراری ایجاد نکند.
   */
  createDraft(payload: CreateDraftPurchaseRequest): Observable<PurchaseRequest> {
    return this.http.post<PurchaseRequest>(`${this.baseUrl}/draft`, payload, {
      headers: { 'Idempotency-Key': payload.idempotencyKey }
    });
  }

  /** ارسال به گردش‌کار */
  submit(id: number): Observable<PurchaseRequest> {
    return this.http.post<PurchaseRequest>(`${this.baseUrl}/${id}/submit`, {});
  }

  /** ساخت کلید یکتاسازی برای یک عملیات ایجاد پیش‌نویس */
  newIdempotencyKey(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `pr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}
