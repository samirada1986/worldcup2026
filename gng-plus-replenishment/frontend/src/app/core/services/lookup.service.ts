import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import { EnumItem, LookupItem } from '../models';

/**
 * لیست‌های انتخابی صفحات.
 * چون این داده‌ها در طول یک نشست تغییر نمی‌کنند، نتیجه در حافظه نگهداری می‌شود.
 */
@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/lookups`;
  private readonly cache = new Map<string, Observable<unknown>>();

  readonly products$ = this.cached<LookupItem[]>('products');
  readonly warehouses$ = this.cached<LookupItem[]>('warehouses');
  readonly sites$ = this.cached<LookupItem[]>('sites');
  readonly productGroups$ = this.cached<LookupItem[]>('product-groups');
  readonly productNatures$ = this.cached<LookupItem[]>('product-natures');
  readonly unitsOfMeasure$ = this.cached<LookupItem[]>('units-of-measure');
  readonly parameterScopes$ = this.cached<LookupItem[]>('parameter-scopes');
  readonly requestTypes$ = this.cached<LookupItem[]>('request-types');
  readonly requestClassifications$ = this.cached<LookupItem[]>('request-classifications');
  readonly qualityControlParameters$ = this.cached<LookupItem[]>('quality-control-parameters');
  readonly testPlans$ = this.cached<LookupItem[]>('test-plans');

  readonly orderingMethods$ = this.cached<EnumItem[]>('ordering-methods');
  readonly comparisonParameters$ = this.cached<EnumItem[]>('comparison-parameters');
  readonly recommendationStatuses$ = this.cached<EnumItem[]>('recommendation-statuses');

  /** پاک کردن حافظه موقت — پس از تغییر داده‌های پایه */
  clearCache(): void {
    this.cache.clear();
  }

  private cached<T>(path: string): Observable<T> {
    const existing = this.cache.get(path);
    if (existing) {
      return existing as Observable<T>;
    }

    const request$ = this.http
      .get<T>(`${this.baseUrl}/${path}`)
      .pipe(shareReplay({ bufferSize: 1, refCount: false }));

    this.cache.set(path, request$);
    return request$;
  }
}
