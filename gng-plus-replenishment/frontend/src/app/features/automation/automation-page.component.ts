import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  DxButtonModule,
  DxDataGridModule,
  DxNumberBoxModule,
  DxSelectBoxModule,
  DxSwitchModule,
  DxTabPanelModule
} from 'devextreme-angular';

import {
  AutomationRunStatus,
  AutomationStatus,
  AutomationTriggerType,
  ReplenishmentSummary
} from '../../core/models';
import { AutomationService, LookupService, NotificationService } from '../../core/services';
import {
  EmptyStateComponent,
  PageHeaderComponent,
  StatusBadgeComponent,
  SummaryBarComponent
} from '../../shared';

/**
 * صفحه «اتوماسیون سفارش‌دهی».
 * زمان‌بندی در نمونه اولیه شبیه‌سازی می‌شود؛ اجرای واقعی از طریق
 * POST /api/automation/replenishment/run انجام می‌گیرد.
 */
@Component({
  selector: 'gng-automation-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    DxTabPanelModule,
    DxDataGridModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxNumberBoxModule,
    DxSwitchModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    SummaryBarComponent
  ],
  templateUrl: './automation-page.component.html',
  styles: [`
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 10px 16px;
    }
    .status-grid__label { font-size: 11px; color: var(--gng-text-muted); display: block; margin-bottom: 3px; }
    .status-grid__value { font-size: 12px; }
    .run-result { margin-top: 8px; }
    .run-result__times { font-size: 11px; color: var(--gng-text-muted); margin-top: 6px; }
  `]
})
export class AutomationPageComponent {
  private readonly service = inject(AutomationService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly lookups = inject(LookupService);

  readonly status = signal<AutomationStatus | null>(null);
  readonly runs = signal<ReplenishmentSummary[]>([]);
  readonly lastRunResult = signal<ReplenishmentSummary | null>(null);

  readonly running = signal(false);
  readonly savingSettings = signal(false);
  readonly runsLoaded = signal(false);

  /** مقادیر قابل ویرایش پنل تنظیمات */
  settings = {
    isEnabled: true,
    triggerType: AutomationTriggerType.Manual,
    dailyRunHour: 2
  };

  readonly triggerTypes = [
    { value: AutomationTriggerType.Manual, name: 'دستی' },
    { value: AutomationTriggerType.DailySchedule, name: 'زمان‌بندی روزانه' }
  ];

  readonly tabs = [
    { title: 'وضعیت اتوماسیون' },
    { title: 'تاریخچه اجرا' }
  ];

  constructor() {
    this.loadStatus();
    this.loadRuns();
  }

  // ------------------------------------------------------------------
  // وضعیت و تنظیمات
  // ------------------------------------------------------------------

  loadStatus(): void {
    this.service.getStatus().subscribe({
      next: status => {
        this.status.set(status);
        this.settings = {
          isEnabled: status.isEnabled,
          triggerType: status.triggerType,
          dailyRunHour: status.dailyRunHour
        };
      },
      error: (error: unknown) =>
        this.notifications.error(error, 'دریافت وضعیت اتوماسیون با خطا مواجه شد.')
    });
  }

  saveSettings(): void {
    this.savingSettings.set(true);

    this.service.updateSettings(this.settings).subscribe({
      next: status => {
        this.savingSettings.set(false);
        this.status.set(status);
        this.notifications.success('تنظیمات اتوماسیون ذخیره شد.');
      },
      error: (error: unknown) => {
        this.savingSettings.set(false);
        this.notifications.error(error, 'ذخیره تنظیمات اتوماسیون با خطا مواجه شد.');
      }
    });
  }

  // ------------------------------------------------------------------
  // اجرا
  // ------------------------------------------------------------------

  /** «اجرای الآن» */
  runNow(): void {
    this.running.set(true);

    this.service.run({ triggerType: AutomationTriggerType.Manual }).subscribe({
      next: result => {
        this.running.set(false);
        this.lastRunResult.set(result.summary);
        this.notifications.success(
          `اجرا خاتمه یافت — ${result.summary.recommendedItems} پیشنهاد از ` +
          `${result.summary.totalItems} کالای بررسی‌شده ایجاد شد.`
        );
        this.loadStatus();
        this.loadRuns();
      },
      error: (error: unknown) => {
        this.running.set(false);
        this.notifications.error(error, 'اجرای اتوماسیون با خطا مواجه شد.');
      }
    });
  }

  // ------------------------------------------------------------------
  // تاریخچه
  // ------------------------------------------------------------------

  loadRuns(): void {
    this.service.getRuns(50).subscribe({
      next: runs => {
        this.runs.set(runs);
        this.runsLoaded.set(true);
      },
      error: (error: unknown) => {
        this.runsLoaded.set(true);
        this.notifications.error(error, 'دریافت تاریخچه اجرا با خطا مواجه شد.');
      }
    });
  }

  openRun(run: ReplenishmentSummary): void {
    this.router.navigate(['/automation/runs', run.automationRunId]);
  }

  runStatusVariant(status: AutomationRunStatus): string {
    switch (status) {
      case AutomationRunStatus.Completed: return 'gng-badge--draft-created';
      case AutomationRunStatus.Failed: return 'gng-badge--error';
      default: return 'gng-badge--needs-review';
    }
  }

  get isScheduled(): boolean {
    return this.settings.triggerType === AutomationTriggerType.DailySchedule;
  }
}
