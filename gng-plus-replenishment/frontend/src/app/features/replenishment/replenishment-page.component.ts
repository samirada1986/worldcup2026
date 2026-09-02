import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxSelectBoxModule
} from 'devextreme-angular';

import {
  AutomationTriggerType,
  PurchaseRequest,
  RECOMMENDATION_STATUS_CLASS,
  RecommendationStatus,
  ReplenishmentFilter,
  ReplenishmentRecommendation,
  ReplenishmentSummary
} from '../../core/models';
import { LookupService, NotificationService, ReplenishmentService } from '../../core/services';
import {
  EmptyStateComponent,
  LookupSelectBoxComponent,
  PageHeaderComponent,
  StatusBadgeComponent,
  SummaryBarComponent
} from '../../shared';
import { PurchaseRequestReviewDialogComponent } from './purchase-request-review-dialog.component';

/**
 * صفحه «سفارش‌دهی کالا».
 * هیچ محاسبه‌ای در این کامپوننت انجام نمی‌شود؛ مقدار پیشنهادی، موجودی موثر
 * و میانگین مصرف همگی از بک‌اند دریافت می‌شوند.
 */
@Component({
  selector: 'gng-replenishment-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    DecimalPipe,
    FormsModule,
    DxDataGridModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    SummaryBarComponent,
    LookupSelectBoxComponent,
    PurchaseRequestReviewDialogComponent
  ],
  templateUrl: './replenishment-page.component.html'
})
export class ReplenishmentPageComponent {
  private readonly service = inject(ReplenishmentService);
  private readonly notifications = inject(NotificationService);

  readonly lookups = inject(LookupService);

  /** ارجاع به گرید — برای پاک کردن انتخاب پس از هر محاسبه */
  @ViewChild('grid') private grid?: DxDataGridComponent;

  readonly rows = signal<ReplenishmentRecommendation[]>([]);
  readonly summary = signal<ReplenishmentSummary | null>(null);
  readonly calculating = signal(false);
  readonly calculated = signal(false);

  readonly selectedKeys = signal<number[]>([]);
  readonly reviewVisible = signal(false);
  readonly reviewRows = signal<ReplenishmentRecommendation[]>([]);

  filter: ReplenishmentFilter = this.emptyFilter();

  constructor() {
    // بارگذاری اولیه تا کاربر بلافاصله وضعیت موجودی را ببیند
    this.calculate();
  }

  // ------------------------------------------------------------------
  // محاسبه
  // ------------------------------------------------------------------

  /** «محاسبه نیاز سفارش» — فراخوانی API محاسبه در بک‌اند */
  calculate(): void {
    this.calculating.set(true);
    this.clearSelection();

    this.service.calculate({ ...this.filter, triggerType: AutomationTriggerType.Manual }).subscribe({
      next: result => {
        this.rows.set(result.recommendations);
        this.summary.set(result.summary);
        this.calculating.set(false);
        this.calculated.set(true);

        this.notifications.info(
          `${result.summary.totalItems} کالا بررسی شد — ` +
          `${result.summary.recommendedItems} کالا نیازمند سفارش، ` +
          `${result.summary.reviewItems} مورد نیازمند بررسی، ` +
          `${result.summary.skippedItems} کالا بدون نیاز.`
        );
      },
      error: (error: unknown) => {
        this.calculating.set(false);
        this.calculated.set(true);
        this.rows.set([]);
        this.summary.set(null);
        this.notifications.error(error, 'محاسبه نیاز سفارش با خطا مواجه شد.');
      }
    });
  }

  /** «جستجو» — همان محاسبه با فیلتر فعلی */
  search(): void {
    this.calculate();
  }

  /** «بازنشانی» فیلترها */
  reset(): void {
    this.filter = this.emptyFilter();
    this.calculate();
  }

  // ------------------------------------------------------------------
  // انتخاب و ارسال
  // ------------------------------------------------------------------

  onSelectionChanged(keys: number[]): void {
    // فقط ردیف‌های قابل انتخاب نگه داشته می‌شوند
    const selectable = new Set(this.rows().filter(r => r.isSelectable).map(r => r.id));
    const next = keys.filter(key => selectable.has(key));

    // بدون این مقایسه، نوشتن دوباره همان مقدار باعث چرخه تشخیص تغییر می‌شود
    if (!sameKeys(this.selectedKeys(), next)) {
      this.selectedKeys.set(next);
    }
  }

  private clearSelection(): void {
    this.selectedKeys.set([]);
    this.grid?.instance?.clearSelection();
  }

  get selectedRows(): ReplenishmentRecommendation[] {
    const keys = new Set(this.selectedKeys());
    return this.rows().filter(row => keys.has(row.id));
  }

  get canSend(): boolean {
    return this.selectedRows.length > 0 && !this.calculating();
  }

  /** «ارسال درخواست خرید» — باز کردن پنجره بازبینی */
  openReview(): void {
    const selected = this.selectedRows;

    if (selected.length === 0) {
      this.notifications.warning('حداقل یک ردیف نیازمند سفارش را انتخاب کنید.');
      return;
    }

    this.reviewRows.set(selected);
    this.reviewVisible.set(true);
  }

  onReviewCompleted(_request: PurchaseRequest): void {
    // پس از ایجاد پیش‌نویس، محاسبه دوباره وضعیت به‌روز ردیف‌ها را نشان می‌دهد
    this.calculate();
  }

  // ------------------------------------------------------------------
  // نمایش
  // ------------------------------------------------------------------

  statusVariant(status: RecommendationStatus): string {
    return RECOMMENDATION_STATUS_CLASS[status] ?? 'gng-badge--no-need';
  }

  /** ردیف‌های غیرقابل انتخاب نباید چک‌باکس فعال داشته باشند */
  isRowSelectable = (row: ReplenishmentRecommendation): boolean => row.isSelectable;

  get automationRunId(): number {
    return this.summary()?.automationRunId ?? 0;
  }

  /** تبدیل مقدار انتخاب‌شده در تقویم به تاریخ ISO بدون بخش زمان */
  toIsoDate(value: Date | string | null): string | null {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00`;
  }

  private emptyFilter(): ReplenishmentFilter {
    return {
      fromDate: null,
      toDate: null,
      productId: null,
      warehouseId: null,
      siteId: null,
      productGroupId: null,
      productNatureId: null,
      parameterScopeId: null,
      comparisonParameter: null,
      surplusPercentage: null
    };
  }
}

/** مقایسه دو فهرست کلید بدون توجه به ترتیب */
function sameKeys(a: readonly number[], b: readonly number[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every(key => set.has(key));
}
