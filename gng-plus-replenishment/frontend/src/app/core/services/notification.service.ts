import { Injectable } from '@angular/core';
import notify from 'devextreme/ui/notify';

import { ApiError } from '../models';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

/** نمایش پیام‌های کوتاه (toast) با ظاهر یکسان در کل ماژول */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private static readonly Durations: Record<NotificationType, number> = {
    success: 3500,
    info: 3500,
    warning: 5000,
    error: 6500
  };

  success(message: string): void {
    this.show(message, 'success');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  /** نمایش خطا — پیام فارسی خطای بک‌اند مستقیماً نمایش داده می‌شود */
  error(error: unknown, fallback = 'انجام عملیات با خطا مواجه شد.'): void {
    const message = error instanceof ApiError ? error.message : fallback;
    this.show(message, 'error');
  }

  private show(message: string, type: NotificationType): void {
    notify(
      {
        message,
        width: 'auto',
        maxWidth: 460,
        rtlEnabled: true,
        position: { my: 'top center', at: 'top center', offset: '0 12' }
      },
      type,
      NotificationService.Durations[type]
    );
  }
}
