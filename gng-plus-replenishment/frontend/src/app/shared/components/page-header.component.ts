import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** سربرگ صفحه — عنوان و توضیح کوتاه */
@Component({
  selector: 'gng-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <h1 class="page-header__title">{{ title }}</h1>
      @if (subtitle) {
        <span class="page-header__subtitle">{{ subtitle }}</span>
      }
      <span class="page-header__spacer"></span>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: baseline;
      gap: 10px;
      padding: 2px 2px 8px;
    }
    .page-header__title { font-size: 15px; font-weight: 700; margin: 0; }
    .page-header__subtitle { font-size: 11px; color: var(--gng-text-muted); }
    .page-header__spacer { flex: 1; }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle?: string;
}
