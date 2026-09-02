import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/**
 * نشانگر وضعیت با ظاهر ERP.
 * کلاس ظاهری از بیرون داده می‌شود تا این کامپوننت به هیچ حوزه کسب‌وکاری وابسته نباشد.
 */
@Component({
  selector: 'gng-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="gng-badge" [class]="'gng-badge ' + variant" [title]="tooltip || text">{{ text }}</span>`
})
export class StatusBadgeComponent {
  /** متن نمایش‌داده‌شده */
  @Input({ required: true }) text = '';

  /** کلاس ظاهری، مثلاً gng-badge--needs-order */
  @Input() variant = 'gng-badge--no-need';

  /** متن راهنمای شناور */
  @Input() tooltip?: string | null;
}
