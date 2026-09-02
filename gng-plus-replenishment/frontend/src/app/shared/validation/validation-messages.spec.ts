import { FormBuilder } from '@angular/forms';

import { dateRange, describeErrors, nonNegative, notLessThan } from './validation-messages';

describe('اعتبارسنجی فرم پارامترهای سفارش‌دهی', () => {
  const fb = new FormBuilder();

  describe('describeErrors', () => {
    it('برای فیلد الزامی پیام فارسی می‌دهد', () =>
      expect(describeErrors({ required: true })).toBe('این فیلد الزامی است.'));

    it('برای مقدار کمتر از حد مجاز پیام فارسی می‌دهد', () =>
      expect(describeErrors({ min: { min: 0 } })).toBe('مقدار نمی‌تواند کمتر از 0 باشد.'));

    it('پیام سفارشی قواعد گروهی را بازمی‌گرداند', () =>
      expect(describeErrors({ message: 'حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.' }))
        .toBe('حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.'));

    it('برای نبود خطا رشته خالی می‌دهد', () => expect(describeErrors(null)).toBe(''));
  });

  describe('nonNegative', () => {
    const validator = nonNegative();

    it('مقدار منفی را رد می‌کند', () =>
      expect(validator(fb.control(-1))).toEqual({ min: { min: 0, actual: -1 } }));

    it('صفر را می‌پذیرد', () => expect(validator(fb.control(0))).toBeNull());

    it('مقدار خالی را نادیده می‌گیرد', () => expect(validator(fb.control(null))).toBeNull());
  });

  describe('notLessThan — حداکثر موجودی در برابر حداقل موجودی', () => {
    const build = () =>
      fb.group(
        { minimumStock: fb.control<number | null>(null), maximumStock: fb.control<number | null>(null) },
        { validators: [notLessThan('minimumStock', 'maximumStock', 'حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.')] }
      );

    it('وقتی حداکثر کمتر از حداقل است خطا روی فیلد حداکثر ثبت می‌شود', () => {
      const group = build();
      group.patchValue({ minimumStock: 500, maximumStock: 200 });

      expect(group.controls.maximumStock.errors?.['message'])
        .toBe('حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.');
      expect(group.controls.minimumStock.errors).toBeNull();
    });

    it('مقادیر معتبر خطایی تولید نمی‌کنند', () => {
      const group = build();
      group.patchValue({ minimumStock: 150, maximumStock: 1000 });

      expect(group.controls.maximumStock.errors).toBeNull();
    });

    it('پس از اصلاح مقدار، خطا پاک می‌شود', () => {
      const group = build();
      group.patchValue({ minimumStock: 500, maximumStock: 200 });
      group.patchValue({ maximumStock: 900 });

      expect(group.controls.maximumStock.errors).toBeNull();
    });

    it('وقتی یکی از دو مقدار خالی است، قاعده اعمال نمی‌شود', () => {
      const group = build();
      group.patchValue({ minimumStock: 500, maximumStock: null });

      expect(group.controls.maximumStock.errors).toBeNull();
    });
  });

  describe('dateRange — تاریخ اعتبار', () => {
    const build = () =>
      fb.group(
        { validFrom: fb.control<Date | null>(null), validTo: fb.control<Date | null>(null) },
        { validators: [dateRange('validFrom', 'validTo', 'تاریخ پایان اعتبار نمی‌تواند پیش از تاریخ شروع اعتبار باشد.')] }
      );

    it('تاریخ پایان پیش از تاریخ شروع را رد می‌کند', () => {
      const group = build();
      group.patchValue({ validFrom: new Date('2026-03-01'), validTo: new Date('2026-02-01') });

      expect(group.controls.validTo.errors?.['message'])
        .toBe('تاریخ پایان اعتبار نمی‌تواند پیش از تاریخ شروع اعتبار باشد.');
    });

    it('بازه معتبر را می‌پذیرد', () => {
      const group = build();
      group.patchValue({ validFrom: new Date('2026-03-01'), validTo: new Date('2026-12-01') });

      expect(group.controls.validTo.errors).toBeNull();
    });
  });
});
