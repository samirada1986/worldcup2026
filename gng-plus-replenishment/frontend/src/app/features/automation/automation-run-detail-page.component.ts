import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DxButtonModule, DxDataGridModule, DxTabPanelModule } from 'devextreme-angular';

import {
  AutomationAuditLog,
  RECOMMENDATION_STATUS_CLASS,
  RecommendationStatus,
  ReplenishmentRecommendation,
  ReplenishmentSummary
} from '../../core/models';
import { AutomationService, NotificationService } from '../../core/services';
import { EmptyStateComponent, PageHeaderComponent, StatusBadgeComponent, SummaryBarComponent } from '../../shared';

/**
 * جزئیات یک اجرای اتوماسیون.
 * نشان می‌دهد هر کالا چرا پیشنهاد گرفته یا کنار گذاشته شده است.
 */
@Component({
  selector: 'gng-automation-run-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    DxTabPanelModule,
    DxDataGridModule,
    DxButtonModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    SummaryBarComponent
  ],
  templateUrl: './automation-run-detail-page.component.html',
  styles: [`
    .run-meta { font-size: 11px; color: var(--gng-text-muted); }
    .audit-values { font-size: 11px; color: var(--gng-text-muted); }
  `]
})
export class AutomationRunDetailPageComponent {
  private readonly service = inject(AutomationService);
  private readonly notifications = inject(NotificationService);

  readonly summary = signal<ReplenishmentSummary | null>(null);
  readonly recommendations = signal<ReplenishmentRecommendation[]>([]);
  readonly auditLogs = signal<AutomationAuditLog[]>([]);
  readonly loaded = signal(false);

  readonly tabs = [
    { title: 'پیشنهادهای اجرا' },
    { title: 'رویدادهای اجرا' }
  ];

  @Input() set id(value: string) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      this.load(parsed);
    }
  }

  load(runId: number): void {
    this.service.getRun(runId).subscribe({
      next: result => {
        this.summary.set(result.summary);
        this.recommendations.set(result.recommendations);
        this.loaded.set(true);
      },
      error: (error: unknown) => {
        this.loaded.set(true);
        this.notifications.error(error, 'دریافت جزئیات اجرا با خطا مواجه شد.');
      }
    });

    this.service.getAudit(runId).subscribe({
      next: logs => this.auditLogs.set(logs),
      error: (error: unknown) =>
        this.notifications.error(error, 'دریافت رویدادهای اجرا با خطا مواجه شد.')
    });
  }

  statusVariant(status: RecommendationStatus): string {
    return RECOMMENDATION_STATUS_CLASS[status] ?? 'gng-badge--no-need';
  }
}
