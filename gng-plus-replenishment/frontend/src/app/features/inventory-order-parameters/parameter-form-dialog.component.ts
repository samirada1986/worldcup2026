import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DxCheckBoxModule,
  DxDateBoxModule,
  DxNumberBoxModule,
  DxPopupModule,
  DxSelectBoxModule
} from 'devextreme-angular';

import {
  ApiError,
  EnumItem,
  InventoryOrderParameter,
  InventoryOrderParameterUpsert,
  OrderingMethod
} from '../../core/models';
import {
  InventoryOrderParameterService,
  LookupService,
  NotificationService
} from '../../core/services';
import { FormFieldComponent, LookupSelectBoxComponent } from '../../shared';
import { dateRange, nonNegative, notLessThan } from '../../shared/validation/validation-messages';

/**
 * فرم افزودن/ویرایش «پارامترهای سفارش‌دهی کالا».
 * اعتبارسنجی سمت کاربر بازخورد فوری می‌دهد؛ تصمیم نهایی با بک‌اند است
 * و خطاهای فیلدی بازگشتی از سرور کنار همان ورودی نمایش داده می‌شوند.
 */
@Component({
  selector: 'gng-parameter-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    DxPopupModule,
    DxSelectBoxModule,
    DxNumberBoxModule,
    DxDateBoxModule,
    DxCheckBoxModule,
    FormFieldComponent,
    LookupSelectBoxComponent
  ],
  templateUrl: './parameter-form-dialog.component.html'
})
export class ParameterFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(InventoryOrderParameterService);
  private readonly notifications = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly lookups = inject(LookupService);

  /** انبارها به صورت سیگنال نگهداری می‌شوند تا انتخاب انبار، سایت را بدون pipe تعیین کند */
  private readonly warehouses = toSignal(this.lookups.warehouses$, { initialValue: [] });

  /** پارامتر در حال ویرایش — خالی یعنی ایجاد رکورد جدید */
  @Input() set parameter(value: InventoryOrderParameter | null) {
    this.editing.set(value);
    this.serverErrors.set({});
    value ? this.patchFrom(value) : this.resetToDefaults();
  }

  @Input() visible = false;
  @Output() readonly visibleChange = new EventEmitter<boolean>();
  @Output() readonly saved = new EventEmitter<InventoryOrderParameter>();

  readonly editing = signal<InventoryOrderParameter | null>(null);
  readonly saving = signal(false);
  readonly serverErrors = signal<Record<string, string>>({});

  readonly form = this.fb.group(
    {
      // --- شناسایی ---
      productId: this.fb.control<number | null>(null, Validators.required),
      warehouseId: this.fb.control<number | null>(null, Validators.required),
      siteId: this.fb.control<number | null>(null, Validators.required),
      parameterScopeId: this.fb.control<number | null>(null, Validators.required),
      unitOfMeasureId: this.fb.control<number | null>(null, Validators.required),
      requestTypeId: this.fb.control<number | null>(null, Validators.required),
      orderingMethod: this.fb.control<OrderingMethod | null>(null, Validators.required),
      defaultRequestClassificationId: this.fb.control<number | null>(null),
      qualityControlParameterId: this.fb.control<number | null>(null),
      testPlanId: this.fb.control<number | null>(null),

      // --- سطوح موجودی ---
      reorderPoint: this.fb.control<number | null>(null, nonNegative()),
      minimumStock: this.fb.control<number | null>(null, nonNegative()),
      maximumStock: this.fb.control<number | null>(null, nonNegative()),
      desiredStockLevel: this.fb.control<number | null>(null, nonNegative()),
      safetyStock: this.fb.control<number | null>(null, nonNegative()),
      specialValueCoefficient: this.fb.control<number | null>(null, nonNegative()),

      // --- مقادیر سفارش ---
      minimumOrderQuantity: this.fb.control<number | null>(null, nonNegative()),
      maximumOrderQuantity: this.fb.control<number | null>(null, nonNegative()),
      orderBatchSize: this.fb.control<number | null>(null, nonNegative()),
      economicOrderQuantity: this.fb.control<number | null>(null, nonNegative()),

      // --- زمان و پوشش ---
      leadTimeDays: this.fb.control<number | null>(null, nonNegative()),
      averageConsumptionDays: this.fb.control<number | null>(null, nonNegative()),
      minimumCoverageDays: this.fb.control<number | null>(null, nonNegative()),
      salesCoverageDays: this.fb.control<number | null>(null, nonNegative()),

      // --- اعتبار ---
      validFrom: this.fb.control<Date | null>(new Date(), Validators.required),
      validTo: this.fb.control<Date | null>(null),
      isActive: this.fb.nonNullable.control(true)
    },
    {
      validators: [
        notLessThan('minimumStock', 'maximumStock',
          'حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.'),
        notLessThan('minimumOrderQuantity', 'maximumOrderQuantity',
          'مقدار حداکثر سفارش نمی‌تواند کمتر از مقدار حداقل سفارش باشد.'),
        dateRange('validFrom', 'validTo',
          'تاریخ پایان اعتبار نمی‌تواند پیش از تاریخ شروع اعتبار باشد.')
      ]
    }
  );

  get title(): string {
    return this.editing()
      ? 'ویرایش پارامتر سفارش‌دهی کالا'
      : 'افزودن پارامتر سفارش‌دهی کالا';
  }

  /** انتخاب انبار، سایت مربوطه را نیز تعیین می‌کند */
  onWarehouseChange(warehouseId: number | null): void {
    this.setControl('warehouseId', warehouseId);

    const siteId = this.warehouses().find(w => w.id === warehouseId)?.parentId ?? null;
    if (siteId !== null) {
      this.setControl('siteId', siteId);
    }
  }

  setControl(name: keyof typeof this.form.controls, value: unknown): void {
    const control = this.form.get(name as string);
    if (!control) return;
    control.setValue(value);
    control.markAsDirty();
    this.clearServerError(name as string);
  }

  serverErrorFor(field: string): string | null {
    return this.serverErrors()[field] ?? null;
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  save(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.notifications.warning('لطفاً خطاهای فرم را برطرف کنید.');
      return;
    }

    const payload = this.toPayload();
    const editing = this.editing();

    this.saving.set(true);
    this.serverErrors.set({});

    const request$ = editing
      ? this.service.update(editing.id, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: result => {
        this.saving.set(false);
        this.notifications.success(
          editing
            ? 'پارامتر سفارش‌دهی با موفقیت به‌روزرسانی شد.'
            : 'پارامتر سفارش‌دهی با موفقیت ثبت شد.'
        );
        this.saved.emit(result);
        this.close();
        this.cdr.markForCheck();
      },
      error: (error: unknown) => {
        this.saving.set(false);

        if (error instanceof ApiError) {
          this.serverErrors.set(error.fieldErrors);
        }

        this.notifications.error(error, 'ثبت پارامتر سفارش‌دهی با خطا مواجه شد.');
        this.cdr.markForCheck();
      }
    });
  }

  private clearServerError(field: string): void {
    const current = this.serverErrors();
    if (!(field in current)) return;

    const { [field]: _removed, ...rest } = current;
    this.serverErrors.set(rest);
  }

  private patchFrom(value: InventoryOrderParameter): void {
    this.form.reset({
      productId: value.productId,
      warehouseId: value.warehouseId,
      siteId: value.siteId,
      parameterScopeId: value.parameterScopeId,
      unitOfMeasureId: value.unitOfMeasureId,
      requestTypeId: value.requestTypeId,
      orderingMethod: value.orderingMethod,
      defaultRequestClassificationId: value.defaultRequestClassificationId ?? null,
      qualityControlParameterId: value.qualityControlParameterId ?? null,
      testPlanId: value.testPlanId ?? null,
      reorderPoint: value.reorderPoint ?? null,
      minimumStock: value.minimumStock ?? null,
      maximumStock: value.maximumStock ?? null,
      desiredStockLevel: value.desiredStockLevel ?? null,
      safetyStock: value.safetyStock ?? null,
      specialValueCoefficient: value.specialValueCoefficient ?? null,
      minimumOrderQuantity: value.minimumOrderQuantity ?? null,
      maximumOrderQuantity: value.maximumOrderQuantity ?? null,
      orderBatchSize: value.orderBatchSize ?? null,
      economicOrderQuantity: value.economicOrderQuantity ?? null,
      leadTimeDays: value.leadTimeDays ?? null,
      averageConsumptionDays: value.averageConsumptionDays ?? null,
      minimumCoverageDays: value.minimumCoverageDays ?? null,
      salesCoverageDays: value.salesCoverageDays ?? null,
      validFrom: value.validFrom ? new Date(value.validFrom) : new Date(),
      validTo: value.validTo ? new Date(value.validTo) : null,
      isActive: value.isActive
    });
  }

  /** بازگرداندن فرم به مقادیر پیش‌فرض یک رکورد جدید */
  private resetToDefaults(): void {
    this.form.reset({ validFrom: new Date(), isActive: true });
  }

  private toPayload(): InventoryOrderParameterUpsert {
    const raw = this.form.getRawValue();

    return {
      ...raw,
      validFrom: toIsoDate(raw.validFrom) ?? new Date().toISOString(),
      validTo: toIsoDate(raw.validTo)
    } as InventoryOrderParameterUpsert;
  }

  /** فهرست نحوه سفارش‌دهی از بک‌اند خوانده می‌شود تا نام‌ها یکسان بمانند */
  trackEnum = (_: number, item: EnumItem) => item.value;
}

/** تبدیل تاریخ به قالب ISO بدون بخش زمان */
function toIsoDate(value: Date | string | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
}
