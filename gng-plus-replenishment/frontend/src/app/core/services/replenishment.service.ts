import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ReplenishmentFilter, ReplenishmentResult } from '../models';

/**
 * API محاسبه نیاز سفارش.
 * تمام محاسبات (موجودی موثر، میانگین مصرف، مقدار پیشنهادی) در بک‌اند انجام می‌شود؛
 * این سرویس فقط فیلتر را ارسال و نتیجه را دریافت می‌کند.
 */
@Injectable({ providedIn: 'root' })
export class ReplenishmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/replenishment`;

  calculate(filter: ReplenishmentFilter): Observable<ReplenishmentResult> {
    return this.http.post<ReplenishmentResult>(`${this.baseUrl}/calculate`, filter);
  }
}
