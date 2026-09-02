import { Routes } from '@angular/router';

/**
 * مسیرهای ماژول سفارش‌دهی کالا.
 * صفحات به صورت تنبل بارگذاری می‌شوند.
 */
export const routes: Routes = [
  {
    path: 'replenishment',
    title: 'سفارش‌دهی کالا',
    loadComponent: () =>
      import('./features/replenishment/replenishment-page.component')
        .then(m => m.ReplenishmentPageComponent)
  },
  {
    path: 'parameters',
    title: 'پارامترهای سفارش‌دهی کالا',
    loadComponent: () =>
      import('./features/inventory-order-parameters/inventory-order-parameters-page.component')
        .then(m => m.InventoryOrderParametersPageComponent)
  },
  {
    path: 'purchase-requests',
    title: 'درخواست‌های خرید',
    loadComponent: () =>
      import('./features/purchase-request/purchase-requests-page.component')
        .then(m => m.PurchaseRequestsPageComponent)
  },
  {
    path: 'purchase-requests/:id',
    title: 'درخواست خرید',
    loadComponent: () =>
      import('./features/purchase-request/purchase-request-detail-page.component')
        .then(m => m.PurchaseRequestDetailPageComponent)
  },
  {
    path: 'automation',
    title: 'اتوماسیون سفارش‌دهی',
    loadComponent: () =>
      import('./features/automation/automation-page.component')
        .then(m => m.AutomationPageComponent)
  },
  {
    path: 'automation/runs/:id',
    title: 'جزئیات اجرا',
    loadComponent: () =>
      import('./features/automation/automation-run-detail-page.component')
        .then(m => m.AutomationRunDetailPageComponent)
  },
  { path: '', pathMatch: 'full', redirectTo: 'replenishment' },
  { path: '**', redirectTo: 'replenishment' }
];
