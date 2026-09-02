import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import config from 'devextreme/core/config';
import { locale, loadMessages } from 'devextreme/localization';
import faMessages from 'devextreme/localization/messages/fa.json';

import { apiInterceptor } from './core/interceptors/api.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { routes } from './app.routes';

// راست‌به‌چپ کردن سراسری کامپوننت‌های DevExtreme
config({ rtlEnabled: true });

// پیام‌های فارسی DevExtreme
loadMessages(faMessages);
locale('fa');

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([loadingInterceptor, apiInterceptor]))
  ]
};
