# سایت بهار افلاطونیان (نسخهٔ استاتیک برای Netlify)

این نسخه کاملاً استاتیک است: **بدون PHP، بدون دیتابیس و بدون پنل مدیریت.** همهٔ محتوا داخل همین پوشه است.

## فایل‌ها

| فایل / پوشه | کار |
|---|---|
| `index.html` | خود سایت: صفحه‌ها، طراحی، منطق |
| `config.js` | حالت استاتیک (`BAHAR_STATIC = true`) و محل داده‌ها (`./data`) |
| `data/bootstrap.json` | **همهٔ محتوای سایت:** نام، بیوگرافی، مجموعه‌ها، عکس‌ها و کپشن‌ها، اسلایدشو، نوشته‌ها، تحصیلات، تماس |
| `data/articles/<id>.json` | متن کامل هر نوشته، مثلاً `1.json` = آرتیست استیتمنت |
| `images/` | عکس‌ها (۲۴۰۰ پیکسل) و Thumbnailها (۴۸۰ پیکسل)، به‌اضافهٔ پرتره |
| `netlify.toml` | تنظیمات Netlify (بدون Build) |
| `vendor/`، `fonts/`، `support.js` | React، فونت‌ها و اجراگر. تغییرشان ندهید. |

## تنظیمات Netlify (یک بار)

1. **Base directory:** `bahar-site`
2. **فرم تماس:** Netlify ← سایت ← **Forms** ← **Enable form detection**. بعد یک بار **Deploys** ← **Trigger deploy** را بزنید.
3. **دریافت پیام‌ها با ایمیل:** **Forms** ← **Form notifications** ← **Add notification** ← **Email notification** ← فرم `contact`.

پیام‌ها در صفحهٔ Forms در Netlify هم دیده می‌شوند. سقف رایگان Netlify Forms حدود ۱۰۰ پیام در ماه است.

## تغییر محتوا (بدون پنل مدیریت)

همهٔ متن‌ها در `data/bootstrap.json` هستند. هر متن دو زبان دارد: `{"en": "...", "fa": "..."}`. فایل را در GitHub ویرایش و Commit کنید. Netlify خودش دوباره منتشر می‌کند.

- **بیوگرافی:** `bio.headline` و `bio.body`
- **متن مجموعه:** `series[0].title` و `blurb` و `statement`
- **کپشن عکس‌ها:** `series[0].photos[n].caption` و `place` (محل و تاریخ)
- **ایمیل تماس:** `contact.blocks[0].body`
- **اینستاگرام:** `site.instagram` (مثلاً `"@name"`) و `site.instagram_url` (`"https://www.instagram.com/name/"`)
- **اسلایدشو:** فهرست `home`. هر مورد به یک عکس از `series` اشاره می‌کند (`photo.index` از ۰ شروع می‌شود).
- **رویداد پیش‌رو:** در `news.upcoming` بنویسید: `{"label": {...}, "title": {...}, "body": {...}, "until": "2026-12-31"}`. بعد از تاریخ `until` خودکار پنهان می‌شود.
- **عکس جدید:**
  1. فایل را در `images/` بگذارید. JPEG با sRGB، عرض حداکثر ۲۴۰۰ پیکسل.
  2. یک Thumbnail با عرض ۴۸۰ پیکسل هم کنارش بگذارید.
  3. یک مورد به `series[...].photos` اضافه کنید، با `image_url`، `thumb_url`، `plate` و `plate_no`.

**قبل از Commit:** JSON نباید خطا داشته باشد (کاما و گیومه). اگر خراب شود، سایت پیام «سایت بارگذاری نشد» نشان می‌دهد. برای بررسی می‌توانید از jsonlint.com استفاده کنید.

## اگر روزی بک‌اند PHP اضافه شد

در `config.js`:
- `BAHAR_STATIC = false`
- `BAHAR_API_BASE` = آدرس API بک‌اند

پنل مدیریت و فرم تماس بک‌اند دوباره فعال می‌شوند.
