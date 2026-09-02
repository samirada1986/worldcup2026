import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ReplenishmentSummary } from '../../core/models';

/**
 * نوار خلاصه نتیجه محاسبه.
 * تمام اعداد از خلاصه‌ای که بک‌اند برمی‌گرداند خوانده می‌شوند.
 */
@Component({
  selector: 'gng-summary-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gng-summary">
      <div class="gng-summary__item gng-summary__item--total">
        <span class="gng-summary__value">{{ summary.totalItems }}</span>
        <span class="gng-summary__label">کالا بررسی شد</span>
      </div>
      <div class="gng-summary__item gng-summary__item--order">
        <span class="gng-summary__value">{{ summary.recommendedItems }}</span>
        <span class="gng-summary__label">کالا نیازمند سفارش</span>
      </div>
      <div class="gng-summary__item gng-summary__item--review">
        <span class="gng-summary__value">{{ summary.reviewItems }}</span>
        <span class="gng-summary__label">مورد نیازمند بررسی</span>
      </div>
      <div class="gng-summary__item gng-summary__item--skipped">
        <span class="gng-summary__value">{{ summary.skippedItems }}</span>
        <span class="gng-summary__label">کالا بدون نیاز</span>
      </div>
      <div class="gng-summary__item gng-summary__item--error">
        <span class="gng-summary__value">{{ summary.errorItems }}</span>
        <span class="gng-summary__label">مورد خطای تنظیمات</span>
      </div>
      @if (showRunInfo) {
        <div class="gng-summary__item">
          <span class="gng-summary__value gng-ltr">{{ summary.automationRunId }}</span>
          <span class="gng-summary__label">شناسه اجرا ({{ summary.triggerTypeName }})</span>
        </div>
      }
    </div>
  `
})
export class SummaryBarComponent {
  @Input({ required: true }) summary!: ReplenishmentSummary;
  @Input() showRunInfo = true;
}
