import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DxSelectBoxModule } from 'devextreme-angular';
import { Observable } from 'rxjs';

import { LookupItem } from '../../core/models';

/**
 * لیست انتخابی مشترک برای داده‌های پایه.
 * قابلیت جستجو و پاک کردن مقدار به صورت پیش‌فرض فعال است.
 */
@Component({
  selector: 'gng-lookup-select-box',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AsyncPipe, DxSelectBoxModule],
  template: `
    <dx-select-box
      [dataSource]="(items$ | async) ?? []"
      [value]="value"
      valueExpr="id"
      [displayExpr]="displayExpr"
      [placeholder]="placeholder"
      [showClearButton]="showClearButton"
      [searchEnabled]="true"
      [disabled]="disabled"
      [isValid]="isValid"
      searchMode="contains"
      noDataText="موردی یافت نشد"
      (onValueChanged)="valueChange.emit($event.value ?? null)">
    </dx-select-box>
  `
})
export class LookupSelectBoxComponent {
  /** منبع داده — معمولاً یکی از جریان‌های LookupService */
  @Input({ required: true }) items$!: Observable<LookupItem[]>;

  @Input() value: number | null = null;
  @Input() placeholder = 'انتخاب کنید';
  @Input() showClearButton = true;
  @Input() disabled = false;
  @Input() isValid = true;

  /** نمایش کد در کنار نام، مناسب فهرست کالاها */
  @Input() showCode = false;

  @Output() readonly valueChange = new EventEmitter<number | null>();

  readonly displayExpr = (item: LookupItem | null): string => {
    if (!item) return '';
    return this.showCode && item.code ? `${item.name} — ${item.code}` : item.name;
  };
}
