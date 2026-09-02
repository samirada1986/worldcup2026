import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DxLoadPanelModule } from 'devextreme-angular';

import { LoadingService } from './core/services';

interface NavigationItem {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

/**
 * پوسته ماژول.
 * ناوبری کامل GNG+ بازسازی نشده است؛ تمرکز روی ناحیه محتوای صفحات ماژول است.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DxLoadPanelModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly loading = inject(LoadingService);

  readonly isLoading = this.loading.isLoading;

  readonly navigation: readonly NavigationItem[] = [
    { path: '/replenishment', label: 'سفارش‌دهی کالا', icon: 'cart' },
    { path: '/parameters', label: 'پارامترهای سفارش‌دهی کالا', icon: 'preferences' },
    { path: '/purchase-requests', label: 'درخواست‌های خرید', icon: 'file' },
    { path: '/automation', label: 'اتوماسیون سفارش‌دهی', icon: 'clock' }
  ];
}
