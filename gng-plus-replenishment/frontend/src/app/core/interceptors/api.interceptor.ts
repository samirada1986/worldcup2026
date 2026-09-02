import { HttpErrorResponse, HttpEvent, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

import { ApiError, ApiErrorResponse, ApiResponse } from '../models';

/**
 * پوشش استاندارد پاسخ بک‌اند را باز می‌کند و خطاها را
 * به ApiError با پیام فارسی قابل نمایش تبدیل می‌کند.
 * هیچ استثنای خام سرور به کامپوننت‌ها نمی‌رسد.
 */
export const apiInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    map((event: HttpEvent<unknown>) => {
      if (!(event instanceof HttpResponse)) {
        return event;
      }

      const body = event.body as ApiResponse<unknown> | null;

      // فقط پاسخ‌هایی که قالب استاندارد دارند باز می‌شوند
      if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
        return event.clone({ body: body.data ?? null });
      }

      return event;
    }),
    catchError((error: unknown) => throwError(() => toApiError(error)))
  );

function toApiError(error: unknown): ApiError {
  if (!(error instanceof HttpErrorResponse)) {
    return new ApiError('UNEXPECTED_ERROR', 'خطای غیرمنتظره‌ای رخ داد.');
  }

  // سرور در دسترس نیست
  if (error.status === 0) {
    return new ApiError(
      'NETWORK_ERROR',
      'ارتباط با سرور برقرار نشد. لطفاً از اجرای سرویس بک‌اند مطمئن شوید.',
      {},
      0
    );
  }

  const body = error.error as ApiErrorResponse | null;

  if (body && typeof body === 'object' && typeof body.code === 'string') {
    return new ApiError(body.code, body.message, body.details ?? {}, error.status);
  }

  return new ApiError(
    'UNEXPECTED_ERROR',
    `درخواست با خطای ${error.status} مواجه شد.`,
    {},
    error.status
  );
}
