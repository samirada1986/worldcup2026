import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

import { describeErrors } from '../validation/validation-messages';

/**
 * قالب یک فیلد فرم: برچسب، ورودی و پیام خطا.
 * ورودی از طریق ng-content تزریق می‌شود تا هر کنترل DevExtreme قابل استفاده باشد.
 */
@Component({
  selector: 'gng-form-field',
  standalone: true,
  // استراتژی پیش‌فرض عمدی است: وضعیت touched/dirty کنترل، ورودی کامپوننت نیست
  // و با OnPush پیام خطا پس از markAllAsTouched نمایش داده نمی‌شد.
  template: `
    <div class="gng-field" [class.gng-field--invalid]="showError">
      <label class="gng-field__label" [class.gng-field__label--required]="required">{{ label }}</label>
      <ng-content></ng-content>
      <div class="gng-field__error">{{ showError ? message : '' }}</div>
    </div>
  `
})
export class FormFieldComponent {
  @Input({ required: true }) label = '';
  @Input() required = false;

  /** کنترل مرتبط — برای استخراج وضعیت و پیام خطا */
  @Input() control?: AbstractControl | null;

  /** خطای سمت سرور برای این فیلد */
  @Input() serverError?: string | null;

  get showError(): boolean {
    if (this.serverError) return true;
    return !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get message(): string {
    return this.serverError || describeErrors(this.control?.errors ?? null);
  }
}
