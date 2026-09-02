/**
 * تنظیمات محیط اجرا.
 * در حالت توسعه، درخواست‌ها از طریق proxy.conf.json به بک‌اند هدایت می‌شوند.
 */
export const environment = {
  production: false,
  /** ریشه APIهای بک‌اند */
  apiBaseUrl: '/api'
};
