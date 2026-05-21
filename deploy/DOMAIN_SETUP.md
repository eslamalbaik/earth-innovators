# نطاقان: الإمارات أساسي (.ae) — Cloud ثانوي (.cloud)

| الدور | النطاق | السيرفر |
|--------|--------|---------|
| **أساسي (الإمارات)** | [earth-innovators.ae](https://earth-innovators.ae/) | سيرفر `.ae` |
| **ثانوي** | [earth-innovators.cloud](https://earth-innovators.cloud/) | سيرفر `.cloud` |

كل سيرفر له **قاعدة بيانات و`.env` خاص** — لا تنسخ `.env` من سيرفر لآخر كما هو.

---

## 1) سيرفر الإمارات `.ae` (الأساسي)

```env
APP_URL=https://earth-innovators.ae
APP_PRIMARY_URL=https://earth-innovators.ae
APP_REDIRECT_TO_PRIMARY=false
APP_SECONDARY_HOSTS=earth-innovators.cloud

SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_DRIVER=database
```

بعد الرفع:

```bash
php artisan db:seed --class=DemoUsersSeeder   # تجريبي فقط
php artisan config:clear
php artisan cache:clear
php artisan migrate --force
npm run build
php artisan storage:link
```

**دخول الأدمن:** `https://earth-innovators.ae/admin/login`

---

## 2) سيرفر `.cloud` (ثانوي)

```env
APP_URL=https://earth-innovators.cloud
APP_PRIMARY_URL=https://earth-innovators.ae
APP_REDIRECT_TO_PRIMARY=true
APP_SECONDARY_HOSTS=earth-innovators.cloud

SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_DRIVER=database
```

- `APP_REDIRECT_TO_PRIMARY=true` يحوّل زوار الموقع العام من `.cloud` إلى `.ae` (301).
- مسارات **لا تُحوَّل:** `/admin/*`, `/api/*`, `/webhook/*`, `/media/*` — لتبقى لوحة التحكم على `.cloud` تعمل حتى تجهّز `.ae`.

عندما يصبح الأدمن على `.ae` جاهزاً، أوقف التحويل أو انقل الأدمن بالكامل إلى `.ae` فقط.

```bash
php artisan config:clear
php artisan cache:clear
npm run build
```

---

## 3) جعل `.ae` هو الأساسي (ملخص)

1. كل الروابط في الإيميلات والـ canonical → `APP_PRIMARY_URL` = `.ae`
2. زوار `.cloud` (الموقع العام) → يُوجَّهون إلى `.ae` إذا `APP_REDIRECT_TO_PRIMARY=true`
3. حساب الأدمن على `.ae` → أنشئه أو `db:seed` على **سيرفر `.ae`**

---

## 4) تشخيص

```bash
php artisan tinker --execute="echo config('app.url');"
php artisan tinker --execute="echo config('site.primary_url');"
php artisan tinker --execute="echo App\Models\User::where('email','admin@demo.com')->count();"
```

| النتيجة | المعنى |
|---------|--------|
| `APP_URL` ≠ نطاق السيرفر الحالي | أصلح `.env` |
| عدد الأدمن `0` | لا يوجد أدمن على **هذا** السيرفر |
