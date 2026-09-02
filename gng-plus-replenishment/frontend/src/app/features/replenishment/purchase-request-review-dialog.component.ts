import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DxDataGridModule, DxPopupModule, DxTextAreaModule } from 'devextreme-angular';

import {
  ApiError,
  DraftPurchaseRequestLine,
  PurchaseRequest,
  ReplenishmentRecommendation
} from '../../core/models';
import { NotificationService, PurchaseRequestService } from '../../core/services';

/** آستانه انحرافی که ثبت دلیل تغییر را الزامی می‌کند — همتای قاعده بک‌اند */
const CHANGE_REASON_THRESHOLD = 0.2;

/** یک ردیف در پنجره بازبینی */
interface ReviewLine {
  recommendationId: number;
  productCode: string;
  productName: string;
  warehouseName: string;
  unitOfMeasureName: string;
  suggestedQuantity: number;
  requestedQuantity: number;
  requestClassificationId: number | null;
  quantityChangeReason: string | null;
}

/**
 * بازبینی نهایی پیش از ایجاد پیش‌نویس درخواست خرید.
 * کاربر می‌تواند مقدار درخواست را اصلاح کند؛ انحراف بیش از ۲۰٪
 * ثبت «دلیل تغییر مقدار پیشنهادی» را الزامی می‌کند.
 */
@Component({
  selector: 'gng-purchase-request-review-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DxPopupModule, DxDataGridModule, DxTextAreaModule],
  templateUrl: './purchase-request-review-dialog.component.html',
  styles: [`
    .review__hint { font-size: 11px; color: var(--gng-text-muted); margin-bottom: 6px; }
    .review__reason { padding: 6px 10px; background: #fff8e0; border-top: 1px solid #ecd68a; }
    .review__reason-label { font-size: 11px; color: #8a6100; display: block; margin-bottom: 3px; }
    .review__result { padding: 6px 2px; }
    .review__result-number { font-size: 15px; font-weight: 700; color: var(--gng-orange-dark); }
    .review__skipped { margin-top: 10px; }
    .review__skipped-item { font-size: 11.5px; color: var(--gng-text-muted); padding: 2px 0; }
  `]
})
export class PurchaseRequestReviewDialogComponent {
  private readonly service = inject(PurchaseRequestService);
  private readonly notifications = inject(NotificationService);

  /** پیشنهادهای انتخاب‌شده در گرید */
  @Input() set recommendations(value: readonly ReplenishmentRecommendation[]) {
    this.lines.set(value.map(toReviewLine));
    this.createdRequest.set(null);
  }

  @Input() automationRunId = 0;
  @Input() visible = false;

  @Output() readonly visibleChange = new EventEmitter<boolean>();

  /** پس از ایجاد پیش‌نویس یا ارسال به گردش‌کار، صفحه باید تازه‌سازی شود */
  @Output() readonly completed = new EventEmitter<PurchaseRequest>();

  readonly lines = signal<ReviewLine[]>([]);
  readonly createdRequest = signal<PurchaseRequest | null>(null);
  readonly saving = signal(false);

  /** ردیف‌هایی که انحراف آن‌ها از آستانه گذشته و هنوز دلیل ندارند */
  readonly linesMissingReason = computed(() =>
    this.lines().filter(line => requiresReason(line) && !line.quantityChangeReason?.trim())
  );

  readonly totalQuantity = computed(() =>
    this.lines().reduce((sum, line) => sum + (line.requestedQuantity || 0), 0)
  );

  requiresReason(line: ReviewLine): boolean {
    return requiresReason(line);
  }

  deviationText(line: ReviewLine): string {
    if (line.suggestedQuantity <= 0) return '';
    const deviation = ((line.requestedQuantity - line.suggestedQuantity) / line.suggestedQuantity) * 100;
    const sign = deviation > 0 ? '+' : '';
    return `${sign}${deviation.toFixed(0)}٪`;
  }

  onQuantityChanged(): void {
    // بازخوانی سیگنال تا محاسبات وابسته به‌روز شوند
    this.lines.update(current => [...current]);
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  /** گام ۱ — ایجاد پیش‌نویس درخواست خرید */
  createDraft(): void {
    const lines = this.lines();

    if (lines.length === 0) {
      this.notifications.warning('هیچ ردیفی برای ایجاد درخواست خرید انتخاب نشده است.');
      return;
    }

    const invalid = lines.find(line => !(line.requestedQuantity > 0));
    if (invalid) {
      this.notifications.warning(`مقدار درخواست «${invalid.productName}» باید بزرگ‌تر از صفر باشد.`);
      return;
    }

    const missing = this.linesMissingReason();
    if (missing.length > 0) {
      this.notifications.warning(
        `برای ${missing.length} ردیف، «دلیل تغییر مقدار پیشنهادی» الزامی است.`
      );
      return;
    }

    const payload = {
      // کلید یکتاسازی تضمین می‌کند فشردن دوباره دکمه، درخواست تکراری نسازد
      idempotencyKey: this.service.newIdempotencyKey(),
      automationRunId: this.automationRunId,
      lines: lines.map<DraftPurchaseRequestLine>(line => ({
        recommendationId: line.recommendationId,
        requestedQuantity: line.requestedQuantity,
        requestClassificationId: line.requestClassificationId,
        quantityChangeReason: line.quantityChangeReason?.trim() || null
      }))
    };

    this.saving.set(true);

    this.service.createDraft(payload).subscribe({
      next: request => {
        this.saving.set(false);
        this.createdRequest.set(request);
        this.notifications.success(
          `پیش‌نویس درخواست خرید با شماره ${request.requestNumber} ایجاد شد.`
        );
        this.completed.emit(request);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notifications.error(error, 'ایجاد پیش‌نویس درخواست خرید با خطا مواجه شد.');

        if (error instanceof ApiError && error.code === 'QUANTITY_CHANGE_REASON_REQUIRED') {
          const id = error.details['recommendationId'];
          if (typeof id === 'number') {
            this.notifications.warning('لطفاً دلیل تغییر مقدار را برای ردیف مشخص‌شده وارد کنید.');
          }
        }
      }
    });
  }

  /** گام ۲ — ارسال به گردش‌کار */
  submitToWorkflow(): void {
    const request = this.createdRequest();
    if (!request) return;

    this.saving.set(true);

    this.service.submit(request.id).subscribe({
      next: updated => {
        this.saving.set(false);
        this.createdRequest.set(updated);
        this.notifications.success(
          `درخواست خرید ${updated.requestNumber} به گردش‌کار ارسال شد.`
        );
        this.completed.emit(updated);
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.notifications.error(error, 'ارسال به گردش‌کار با خطا مواجه شد.');
      }
    });
  }

  /** آیا درخواست ایجادشده هنوز در وضعیت پیش‌نویس است */
  get canSubmit(): boolean {
    const request = this.createdRequest();
    return !!request && request.statusName === 'پیش‌نویس';
  }
}

function toReviewLine(row: ReplenishmentRecommendation): ReviewLine {
  return {
    recommendationId: row.id,
    productCode: row.productCode,
    productName: row.productName,
    warehouseName: row.warehouseName,
    unitOfMeasureName: row.unitOfMeasureName,
    suggestedQuantity: row.suggestedQuantity,
    requestedQuantity: row.requestedQuantity || row.suggestedQuantity,
    requestClassificationId: row.requestClassificationId ?? null,
    quantityChangeReason: null
  };
}

function requiresReason(line: ReviewLine): boolean {
  if (line.suggestedQuantity <= 0) return line.requestedQuantity > 0;

  const deviation = Math.abs(line.requestedQuantity - line.suggestedQuantity) / line.suggestedQuantity;
  return deviation > CHANGE_REASON_THRESHOLD;
}
