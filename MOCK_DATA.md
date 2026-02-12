# استفاده از داده‌های Mock

این پروژه از داده‌های JSON موقت (Mock Data) برای تست فرانت‌اند استفاده می‌کند. بعداً می‌توانید به راحتی به API بک‌اند متصل شوید.

## فعال‌سازی Mock Data

برای استفاده از داده‌های موقت، یک فایل `.env` در ریشه پروژه ایجاد کنید:

```env
VITE_USE_MOCK_DATA=true
```

یا در فایل `.env.local`:

```env
VITE_USE_MOCK_DATA=true
VITE_API_BASE_URL=http://localhost:8000/api
```

## داده‌های Mock موجود

### Profile (پروفایل)
- Username: `owner`
- Full Name: `Page Owner`
- Avatar: تصویر نمونه
- Verified: ✓
- Posts: 42
- Followers: 1,250
- Following: 380

### Stories (استوری‌ها)
3 استوری نمونه با تصاویر تصادفی از Picsum Photos

### Story Insights (آمار استوری)
داده‌های آماری کامل برای هر استوری شامل:
- Total Views
- Unique Viewers
- Reach
- Impressions
- Views Timeline
- Viewer List

### Settings (تنظیمات)
- Story Insights Visible: `true`
- Story Expiration Duration: `24` hours
- Compression Level: `medium`

## نحوه کار

هوک‌ها به صورت خودکار:
1. ابتدا سعی می‌کنند از API داده بگیرند
2. اگر API در دسترس نباشد یا خطا بدهد، از Mock Data استفاده می‌کنند
3. اگر `VITE_USE_MOCK_DATA=true` باشد، همیشه از Mock Data استفاده می‌شود

## اتصال به API

برای اتصال به API بک‌اند:

1. فایل `.env` را ویرایش کنید:
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8000/api
```

2. بک‌اند را اجرا کنید (Django)

3. اپلیکیشن به صورت خودکار از API استفاده خواهد کرد

## فایل‌های مرتبط

- `src/data/mockData.ts` - داده‌های Mock
- `src/hooks/useProfile.ts` - هوک پروفایل
- `src/hooks/useStories.ts` - هوک استوری‌ها
- `src/hooks/useSettings.ts` - هوک تنظیمات

## ویرایش داده‌های Mock

می‌توانید داده‌های Mock را در فایل `src/data/mockData.ts` ویرایش کنید.

