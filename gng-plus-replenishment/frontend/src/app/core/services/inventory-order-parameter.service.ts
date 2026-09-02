import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  InventoryOrderParameter,
  InventoryOrderParameterUpsert,
  ParameterQuery
} from '../models';

/** APIهای پارامترهای سفارش‌دهی کالا */
@Injectable({ providedIn: 'root' })
export class InventoryOrderParameterService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/inventory-order-parameters`;

  query(filter: ParameterQuery = {}): Observable<InventoryOrderParameter[]> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filter)) {
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, String(value));
      }
    }

    return this.http.get<InventoryOrderParameter[]>(this.baseUrl, { params });
  }

  get(id: number): Observable<InventoryOrderParameter> {
    return this.http.get<InventoryOrderParameter>(`${this.baseUrl}/${id}`);
  }

  create(payload: InventoryOrderParameterUpsert): Observable<InventoryOrderParameter> {
    return this.http.post<InventoryOrderParameter>(this.baseUrl, payload);
  }

  update(id: number, payload: InventoryOrderParameterUpsert): Observable<InventoryOrderParameter> {
    return this.http.put<InventoryOrderParameter>(`${this.baseUrl}/${id}`, payload);
  }

  changeStatus(id: number, isActive: boolean): Observable<InventoryOrderParameter> {
    return this.http.patch<InventoryOrderParameter>(`${this.baseUrl}/${id}/status`, { isActive });
  }
}
