import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DxButtonModule, DxDataGridModule } from 'devextreme-angular';

import {
  PURCHASE_REQUEST_STATUS_CLASS,
  PurchaseRequest,
  PurchaseRequestStatus
} from '../../core/models';
import { ConfirmService, NotificationService, PurchaseRequestService } from '../../core/services';
import { PageHeaderComponent, StatusBadgeComponent } from '../../shared';

/** جزئیات یک درخواست خرید و اقدام «ارسال به گردش‌کار» */
@Component({
  selector: 'gng-purchase-request-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink,
    DxDataGridModule,
    DxButtonModule,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  templateUrl: './purchase-request-detail-page.component.html',
  styles: [`
    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 8px 16px;
    }
    .detail-grid__label { font-size: 11px; color: var(--gng-text-muted); display: block; }
    .detail-grid__value { font-size: 12px; }
  `]
})
export class PurchaseRequestDetailPageComponent {
  private readonly service = inject(PurchaseRequestService);
  private readonly notifications = inject(NotificationService);
  private readonly confirmation = inject(ConfirmService);

  readonly request = signal<PurchaseRequest | null>(null);
  readonly submitting = signal(false);

  /** شناسه از مسیر خوانده می‌شود (withComponentInputBinding) */
  @Input() set id(value: string) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      this.load(parsed);
    }
  }

  load(id: number): void {
    this.service.get(id).subscribe({
      next: request => this.request.set(request),
      error: (error: unknown) =>
        this.notifications.error(error, 'دریافت درخواست خرید با خطا مواجه شد.')
    });
  }

  get canSubmit(): boolean {
    const request = this.request();
    return !!request && request.status === PurchaseRequestStatus.Draft && !this.submitting();
  }

  async submit(): Promise<void> {
    const request = this.request();
    if (!request) return;

    const confirmed = await this.confirmation.ask(
      `درخواست خرید ${request.requestNumber} با ${request.items.length} ردیف به گردش‌کار ارسال شود؟`,
      'ارسال به گردش‌کار'
    );

    if (!confirmed) return;

    this.submitting.set(true);

    this.service.submit(request.id).subscribe({
      next: updated => {
        this.submitting.set(false);
        this.request.set(updated);
        this.notifications.success(
          `درخواست خرید ${updated.requestNumber} به گردش‌کار ارسال شد.`
        );
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.notifications.error(error, 'ارسال به گردش‌کار با خطا مواجه شد.');
      }
    });
  }

  statusVariant(status: PurchaseRequestStatus): string {
    return PURCHASE_REQUEST_STATUS_CLASS[status] ?? 'gng-badge--no-need';
  }
}
