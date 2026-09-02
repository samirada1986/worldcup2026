/** پوشش استاندارد پاسخ موفق بک‌اند */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  code?: string;
  message?: string;
  details?: Record<string, unknown>;
}

/** پاسخ استاندارد خطا */
export interface ApiErrorResponse {
  success: false;
  code: string;
  message: string;
  details: Record<string, unknown>;
}

/**
 * خطای APIهای بک‌اند به شکل قابل استفاده در کامپوننت‌ها.
 * پیام همیشه فارسی و قابل نمایش مستقیم به کاربر است.
 */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    override readonly message: string,
    readonly details: Record<string, unknown> = {},
    readonly status = 0
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** خطاهای اعتبارسنجی به تفکیک فیلد */
  get fieldErrors(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(this.details)) {
      if (typeof value === 'string') {
        result[key.charAt(0).toLowerCase() + key.slice(1)] = value;
      }
    }
    return result;
  }
}
