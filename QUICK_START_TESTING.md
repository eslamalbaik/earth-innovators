# ⚡ بدء سريع - تشغيل الاختبارات مع MySQL

## 🚀 خطوات سريعة (3 دقائق)

### 1. إنشاء قاعدة بيانات testing
```sql
CREATE DATABASE testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. تحديث phpunit.xml (تم بالفعل ✅)

تم تحديث `phpunit.xml` لاستخدام MySQL. تأكد فقط من تحديث `DB_USERNAME` و `DB_PASSWORD` إذا كانت مختلفة:

```xml
<env name="DB_USERNAME" value="root"/>  <!-- غيّر إذا لزم الأمر -->
<env name="DB_PASSWORD" value=""/>      <!-- غيّر إذا لزم الأمر -->
```

### 3. تشغيل Migrations
```bash
php artisan migrate --env=testing
```

### 4. تشغيل الاختبارات
```bash
php artisan test --filter Package
```

## ✅ إذا نجح الاختبار

سترى:
```
PASS  Tests\Unit\Services\PackageServiceTest
  ✓ can create package
  ✓ can update package
  ... (17 tests)

Tests:    17 passed
```

## 🐛 إذا فشل الاختبار

### خطأ: Unknown database 'testing'
**الحل:**
```sql
CREATE DATABASE testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### خطأ: Access denied
**الحل:**
```sql
GRANT ALL PRIVILEGES ON testing.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### خطأ: Connection refused
**الحل:** تأكد من أن MySQL يعمل:
```bash
# Windows
net start mysql
```

## 📝 ملاحظات

- ✅ قاعدة البيانات `testing` منفصلة عن قاعدة البيانات الرئيسية
- ✅ البيانات آمنة - الاختبارات لا تؤثر على البيانات الحقيقية
- ✅ التنظيف التلقائي بعد كل اختبار

## 🎉 جاهز!

بعد إكمال الخطوات، شغّل:
```bash
php artisan test --filter Package
```

وستعمل جميع الاختبارات! ✅









