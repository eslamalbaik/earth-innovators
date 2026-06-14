# نطاقان: الإمارات أساسي (.ae) — Cloud ثانوي (.cloud)

| الدور | النطاق | السيرفر |
|--------|--------|---------|
| **أساسي (الإمارات)** | [earth-innovators.ae](https://earth-innovators.ae/) | سيرفر `.ae` |
| **ثانوي** | [earth-innovators.cloud](https://earth-innovators.cloud/) | سيرفر `.cloud` |

كل سيرفر له **قاعدة بيانات و`.env` خاص** — لا تنسخ `.env` من سيرفر لآخر كما هو.

---

## 1) سيرفر الإمارات `.ae` (الأساسي)

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://earth-innovators.ae
APP_PRIMARY_URL=https://earth-innovators.ae
APP_REDIRECT_TO_PRIMARY=false
APP_SECONDARY_HOSTS=earth-innovators.cloud

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
```

**أخطاء شائعة تمنع دخول الأدمن:**
- `APP_ENV=loacal` ← خطأ إملائي، استخدم `production`
- `APP_URL` لا يساوي `https://earth-innovators.ae`
- **`SESSION_DOMAIN=earth-innovators.cloud`** (منسوخ من سيرفر `.cloud`) — المتصفح يرفض الكوكي على `.ae` ولا تُحفظ الجلسة بعد تسجيل الدخول. استخدم `SESSION_DOMAIN=null` على سيرفر `.ae`
- لا يوجد مستخدم `admin` في قاعدة `erthnew` على هذا السيرفر

**تشخيص سريع (من جهازك):**

```bash
curl -sI https://earth-innovators.ae/admin/login | findstr /i "set-cookie domain"
```

إذا ظهر `domain=earth-innovators.cloud` وأنت على `.ae` رغم أن `.env` صحيح → **كاش الإعدادات قديم**:

```bash
cd /var/www/earth-innovators
php artisan config:clear
rm -f bootstrap/cache/config.php
php artisan site:diagnose
sudo systemctl reload php8.2-fpm   # أو php8.3-fpm حسب السيرفر
```

`SESSION_DOMAIN=null` في الملف لا يكفي إذا سبق تشغيل `php artisan config:cache` والقيمة القديمة ما زالت في `bootstrap/cache/config.php`.

**ملاحظة:** `.ae` و `.cloud` يشيران حالياً لنفس IP — سيرفر واحد وملف `.env` واحد.

بعد الرفع:

```bash
php artisan admin:ensure --email=admin@demo.com --password='YourStrongPass123'
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

## 5) خطأ `BreezeServiceProvider not found` على السيرفر

يحدث عند `composer install --no-dev` مع كاش قديم. نفّذ:

```bash
cd /var/www/earth-innovators
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php bootstrap/cache/config.php
composer install --no-dev --optimize-autoloader
php artisan package:discover --ansi
php artisan config:clear
php artisan cache:clear
```

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
