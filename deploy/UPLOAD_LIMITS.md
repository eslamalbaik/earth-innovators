# حل خطأ 413 عند رفع الملفات

خطأ `413 Request Entity Too Large` الظاهر من `nginx` يعني أن الطلب توقف عند Nginx قبل أن يصل إلى Laravel.

## Nginx

انسخ إعداد الرفع إلى السيرفر:

```bash
sudo cp deploy/nginx/earth-innovators-upload-limits.conf /etc/nginx/conf.d/earth-innovators-upload-limits.conf
sudo nginx -t
sudo systemctl reload nginx
```

إذا كان ملف الموقع داخل `/etc/nginx/sites-available/...` يحتوي قيمة أصغر مثل:

```nginx
client_max_body_size 200k;
```

احذفها أو غيّرها إلى:

```nginx
client_max_body_size 64m;
```

ثم أعد تحميل Nginx.

## PHP-FPM

تمت إضافة `public/.user.ini` لضبط:

```ini
upload_max_filesize = 50M
post_max_size = 64M
```

إذا كان السيرفر يمنع `.user.ini` أو يستخدم `php_admin_value` في إعدادات PHP-FPM، اضبط نفس القيم في ملف PHP-FPM ثم أعد تشغيله:

```bash
sudo systemctl reload php8.3-fpm
```

استبدل `php8.3-fpm` بإصدار PHP المستخدم على السيرفر إذا كان مختلفًا.
