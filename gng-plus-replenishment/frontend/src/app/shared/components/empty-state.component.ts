import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** وضعیت خالی — پیش از اولین جستجو یا وقتی نتیجه‌ای وجود ندارد */
@Component({
  selector: 'gng-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="gng-empty">
      <div class="gng-empty__title">{{ title }}</div>
      @if (description) {
        <div>{{ description }}</div>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() description?: string;
}
