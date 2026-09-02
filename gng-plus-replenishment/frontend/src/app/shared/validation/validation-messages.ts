import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * پیام‌های فارسی خطای اعتبارسنجی.
 * اعتبارسنجی نهایی همیشه در بک‌اند انجام می‌شود؛ این پیام‌ها
 * فقط بازخورد فوری به کاربر می‌دهند.
 */
export function describeErrors(errors: ValidationErrors | null): string {
  if (!errors) return '';

  if (errors['required']) return 'این فیلد الزامی است.';
  if (errors['min']) return `مقدار نمی‌تواند کمتر از ${errors['min'].min} باشد.`;
  if (errors['max']) return `مقدار نمی‌تواند بیشتر از ${errors['max'].max} باشد.`;
  if (errors['maxlength']) return `حداکثر ${errors['maxlength'].requiredLength} نویسه مجاز است.`;
  if (typeof errors['message'] === 'string') return errors['message'];

  return 'مقدار وارد شده معتبر نیست.';
}

/** مقدار باید صفر یا بزرگ‌تر باشد */
export function nonNegative(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;
    return Number(value) < 0 ? { min: { min: 0, actual: value } } : null;
  };
}

/**
 * مقدار فیلد دوم نمی‌تواند کمتر از فیلد اول باشد.
 * خطا روی فیلد دوم ثبت می‌شود تا کنار همان ورودی نمایش داده شود.
 */
export function notLessThan(lowerField: string, upperField: string, message: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const lower = group.get(lowerField);
    const upper = group.get(upperField);
    if (!lower || !upper) return null;

    const lowerValue = lower.value;
    const upperValue = upper.value;

    // خطاهای دیگر همان فیلد نباید پاک شوند
    const existing = { ...(upper.errors ?? {}) };
    delete existing['message'];

    const invalid =
      lowerValue !== null && lowerValue !== undefined && lowerValue !== '' &&
      upperValue !== null && upperValue !== undefined && upperValue !== '' &&
      Number(upperValue) < Number(lowerValue);

    const next = invalid ? { ...existing, message } : existing;
    upper.setErrors(Object.keys(next).length > 0 ? next : null);

    return null;
  };
}

/** تاریخ پایان نمی‌تواند پیش از تاریخ شروع باشد */
export function dateRange(fromField: string, toField: string, message: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const from = group.get(fromField);
    const to = group.get(toField);
    if (!from || !to) return null;

    const existing = { ...(to.errors ?? {}) };
    delete existing['message'];

    const fromValue = from.value ? new Date(from.value).getTime() : null;
    const toValue = to.value ? new Date(to.value).getTime() : null;

    const invalid = fromValue !== null && toValue !== null && toValue < fromValue;
    const next = invalid ? { ...existing, message } : existing;
    to.setErrors(Object.keys(next).length > 0 ? next : null);

    return null;
  };
}
