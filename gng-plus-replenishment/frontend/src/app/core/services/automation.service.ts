import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AutomationAuditLog,
  AutomationStatus,
  ReplenishmentResult,
  ReplenishmentSummary,
  RunAutomation,
  UpdateAutomationSettings
} from '../models';

/** APIهای اتوماسیون سفارش‌دهی و تاریخچه اجرا */
@Injectable({ providedIn: 'root' })
export class AutomationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/automation`;

  getStatus(): Observable<AutomationStatus> {
    return this.http.get<AutomationStatus>(`${this.baseUrl}/replenishment/status`);
  }

  updateSettings(payload: UpdateAutomationSettings): Observable<AutomationStatus> {
    return this.http.put<AutomationStatus>(`${this.baseUrl}/replenishment/settings`, payload);
  }

  run(payload: RunAutomation): Observable<ReplenishmentResult> {
    return this.http.post<ReplenishmentResult>(`${this.baseUrl}/replenishment/run`, payload);
  }

  getRuns(take = 50): Observable<ReplenishmentSummary[]> {
    const params = new HttpParams().set('take', take);
    return this.http.get<ReplenishmentSummary[]>(`${this.baseUrl}/runs`, { params });
  }

  getRun(id: number): Observable<ReplenishmentResult> {
    return this.http.get<ReplenishmentResult>(`${this.baseUrl}/runs/${id}`);
  }

  getAudit(runId: number): Observable<AutomationAuditLog[]> {
    return this.http.get<AutomationAuditLog[]>(`${this.baseUrl}/runs/${runId}/audit`);
  }
}
