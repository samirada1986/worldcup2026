import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DxButtonModule, DxDataGridModule } from 'devextreme-angular';

import { PURCHASE_REQUEST_STATUS_CLASS, PurchaseRequest, PurchaseRequestStatus } from '../../core/models';
import { NotificationService, PurchaseRequestService } from '../../core/services';
import { EmptyStateComponent, PageHeaderComponent, StatusBadgeComponent } from '../../shared';

/** فهرست درخواست‌های خرید ایجادشده توسط اتوماسیون یا کاربر */
@Component({
  selector: 'gng-purchase-requests-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    DxDataGridModule,
    DxButtonModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent
  ],
  templateUrl: './purchase-requests-page.component.html'
})
export class PurchaseRequestsPageComponent {
  private readonly service = inject(PurchaseRequestService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly rows = signal<PurchaseRequest[]>([]);
  readonly loaded = signal(false);

  constructor() {
    this.load();
  }

  load(): void {
    this.service.getAll().subscribe({
      next: rows => {
        this.rows.set(rows);
        this.loaded.set(true);
      },
      error: (error: unknown) => {
        this.loaded.set(true);
        this.notifications.error(error, 'دریافت فهرست درخواست‌های خرید با خطا مواجه شد.');
      }
    });
  }

  open(request: PurchaseRequest): void {
    this.router.navigate(['/purchase-requests', request.id]);
  }

  statusVariant(status: PurchaseRequestStatus): string {
    return PURCHASE_REQUEST_STATUS_CLASS[status] ?? 'gng-badge--no-need';
  }

  itemCount(request: PurchaseRequest): number {
    return request.items.length;
  }
}
