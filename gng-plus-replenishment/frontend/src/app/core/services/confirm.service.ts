import { Injectable } from '@angular/core';
import { confirm } from 'devextreme/ui/dialog';

/** پرسش تایید پیش از عملیات مهم */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  /**
   * نمایش پنجره تایید.
   * پیام می‌تواند شامل HTML ساده برای تاکید روی مقادیر باشد.
   */
  ask(message: string, title = 'تایید عملیات'): Promise<boolean> {
    return confirm(message, title).then(result => result === true);
  }
}
