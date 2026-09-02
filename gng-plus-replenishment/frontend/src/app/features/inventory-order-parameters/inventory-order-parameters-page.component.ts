import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DxButtonModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule } from 'devextreme-angular';

import { InventoryOrderParameter, ParameterQuery } from '../../core/models';
import {
  ConfirmService,
  InventoryOrderParameterService,
  LookupService,
  NotificationService
} from '../../core/services';
import { EmptyStateComponent, LookupSelectBoxComponent, PageHeaderComponent, StatusBadgeComponent } from '../../shared';
import { ParameterFormDialogComponent } from './parameter-form-dialog.component';

/** صفحه «پارامترهای سفارش‌دهی کالا» */
@Component({
  selector: 'gng-inventory-order-parameters-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormsModule,
    DxDataGridModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    PageHeaderComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    LookupSelectBoxComponent,
    ParameterFormDialogComponent
  ],
  templateUrl: './inventory-order-parameters-page.component.html'
})
export class InventoryOrderParametersPageComponent {
  private readonly service = inject(InventoryOrderParameterService);
  private readonly notifications = inject(NotificationService);
  private readonly confirmation = inject(ConfirmService);

  readonly lookups = inject(LookupService);

  readonly rows = signal<InventoryOrderParameter[]>([]);
  readonly loading = signal(false);
  readonly searched = signal(false);

  readonly dialogVisible = signal(false);
  readonly editingParameter = signal<InventoryOrderParameter | null>(null);

  filter: ParameterQuery = {
    productId: null,
    warehouseId: null,
    siteId: null,
    isActive: null,
    search: null
  };

  readonly activeOptions = [
    { value: null, name: 'همه' },
    { value: true, name: 'فعال' },
    { value: false, name: 'غیرفعال' }
  ];

  constructor() {
    this.search();
  }

  search(): void {
    this.loading.set(true);

    this.service.query(this.filter).subscribe({
      next: rows => {
        this.rows.set(rows);
        this.loading.set(false);
        this.searched.set(true);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.searched.set(true);
        this.notifications.error(error, 'دریافت فهرست پارامترها با خطا مواجه شد.');
      }
    });
  }

  reset(): void {
    this.filter = { productId: null, warehouseId: null, siteId: null, isActive: null, search: null };
    this.search();
  }

  add(): void {
    this.editingParameter.set(null);
    this.dialogVisible.set(true);
  }

  edit(row: InventoryOrderParameter): void {
    this.editingParameter.set(row);
    this.dialogVisible.set(true);
  }

  async toggleStatus(row: InventoryOrderParameter): Promise<void> {
    const nextState = !row.isActive;
    const action = nextState ? 'فعال' : 'غیرفعال';

    const confirmed = await this.confirmation.ask(
      `آیا پارامتر سفارش‌دهی «${row.productName}» در انبار «${row.warehouseName}» ${action} شود؟`,
      `${action} کردن پارامتر`
    );

    if (!confirmed) return;

    this.service.changeStatus(row.id, nextState).subscribe({
      next: () => {
        this.notifications.success(`پارامتر سفارش‌دهی ${action} شد.`);
        this.search();
      },
      error: (error: unknown) =>
        this.notifications.error(error, 'تغییر وضعیت پارامتر با خطا مواجه شد.')
    });
  }

  onSaved(): void {
    this.search();
  }

  /** نشانگر وضعیت فعال/غیرفعال */
  statusVariant(isActive: boolean): string {
    return isActive ? 'gng-badge--draft-created' : 'gng-badge--no-need';
  }
}
