# 🔧 إعداد الاختبارات مع MySQL

## 📋 المتطلبات

1. MySQL مثبت ويعمل
2. قاعدة بيانات `testing` موجودة
3. صلاحيات المستخدم للوصول إلى قاعدة البيانات

## 🚀 خطوات الإعداد

### 1. إنشاء قاعدة بيانات testing

```sql
CREATE DATABASE testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

أو من سطر الأوامر:
```bash
mysql -u root -p -e "CREATE DATABASE testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. تحديث phpunit.xml

تم تحديث `phpunit.xml` لاستخدام MySQL. تأكد من أن الإعدادات صحيحة:

```xml
<env name="DB_CONNECTION" value="mysql"/>
<env name="DB_DATABASE" value="testing"/>
<env name="DB_HOST" value="127.0.0.1"/>
<env name="DB_PORT" value="3306"/>
<env name="DB_USERNAME" value="root"/>
<env name="DB_PASSWORD" value=""/>
```

**ملاحظة:** قم بتحديث `DB_USERNAME` و `DB_PASSWORD` حسب إعداداتك.

### 3. تشغيل Migrations

```bash
php artisan migrate --database=mysql --env=testing
```

أو يمكنك إنشاء ملف `.env.testing`:

```env
APP_ENV=testing
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=testing
DB_USERNAME=root
DB_PASSWORD=
```

ثم:
```bash
php artisan migrate --env=testing
```

### 4. التحقق من الإعداد

```bash
# تشغيل اختبار واحد للتأكد
php artisan test --filter test_can_create_package
```

إذا نجح الاختبار، فالإعداد صحيح! ✅

## 🧪 تشغيل الاختبارات

```bash
# جميع الاختبارات
php artisan test

# اختبارات الباقات فقط
php artisan test --filter Package

# Unit Tests
php artisan test tests/Unit/Services/PackageServiceTest.php

# Feature Tests
php artisan test tests/Feature/PackageControllerTest.php
```

## 🔄 تنظيف قاعدة البيانات

بعد كل تشغيل للاختبارات، قاعدة البيانات `testing` يتم تنظيفها تلقائياً بواسطة `RefreshDatabase` trait.

إذا أردت تنظيفها يدوياً:

```sql
DROP DATABASE testing;
CREATE DATABASE testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## ⚠️ ملاحظات مهمة

1. **قاعدة البيانات منفصلة:** قاعدة البيانات `testing` منفصلة تماماً عن قاعدة البيانات الرئيسية
2. **البيانات آمنة:** لا تقلق، الاختبارات لا تؤثر على قاعدة البيانات الرئيسية
3. **التنظيف التلقائي:** `RefreshDatabase` يقوم بتنظيف قاعدة البيانات بعد كل اختبار
4. **الأداء:** MySQL أبطأ قليلاً من SQLite في الذاكرة، لكنه أكثر واقعية

## 🐛 استكشاف الأخطاء

### مشكلة: Access denied
**الحل:** تأكد من أن المستخدم لديه صلاحيات على قاعدة البيانات `testing`

```sql
GRANT ALL PRIVILEGES ON testing.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### مشكلة: Unknown database 'testing'
**الحل:** قم بإنشاء قاعدة البيانات:
```sql
CREATE DATABASE testing;
```

### مشكلة: Connection refused
**الحل:** تأكد من أن MySQL يعمل:
```bash
# Windows
net start mysql

# Linux/Mac
sudo service mysql start
```

## ✅ Checklist

- [ ] MySQL مثبت ويعمل
- [ ] قاعدة بيانات `testing` موجودة
- [ ] `phpunit.xml` محدث بإعدادات MySQL الصحيحة
- [ ] Migrations تم تشغيلها
- [ ] اختبار واحد على الأقل يمر بنجاح

## 🎉 النتيجة

بعد إكمال الإعداد:
- ✅ جميع الاختبارات تعمل مع MySQL
- ✅ قاعدة البيانات منفصلة وآمنة
- ✅ التنظيف التلقائي بعد كل اختبار
- ✅ جاهز للاختبار!









