# 🔧 إعداد الاختبارات

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

تم تحديث `phpunit.xml` لاستخدام MySQL. تأكد من تحديث `DB_USERNAME` و `DB_PASSWORD` حسب إعداداتك:

```xml
<env name="DB_CONNECTION" value="mysql"/>
<env name="DB_DATABASE" value="testing"/>
<env name="DB_HOST" value="127.0.0.1"/>
<env name="DB_PORT" value="3306"/>
<env name="DB_USERNAME" value="root"/>
<env name="DB_PASSWORD" value=""/>
```

### 3. تشغيل Migrations

```bash
php artisan migrate --env=testing
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

## ✅ التحقق من الإعداد

```bash
# تشغيل اختبار واحد للتأكد
php artisan test --filter test_can_create_package
```

إذا نجح الاختبار، فالإعداد صحيح! ✅

## 🚀 تشغيل جميع الاختبارات

```bash
# جميع الاختبارات
php artisan test

# اختبارات الباقات فقط
php artisan test --filter Package

# Unit Tests فقط
php artisan test tests/Unit

# Feature Tests فقط
php artisan test tests/Feature
```

## 🔄 تنظيف قاعدة البيانات

بعد كل تشغيل للاختبارات، قاعدة البيانات `testing` يتم تنظيفها تلقائياً بواسطة `RefreshDatabase` trait.

## ⚠️ ملاحظات مهمة

1. **قاعدة البيانات منفصلة:** قاعدة البيانات `testing` منفصلة تماماً عن قاعدة البيانات الرئيسية
2. **البيانات آمنة:** لا تقلق، الاختبارات لا تؤثر على قاعدة البيانات الرئيسية
3. **التنظيف التلقائي:** `RefreshDatabase` يقوم بتنظيف قاعدة البيانات بعد كل اختبار
4. **الأداء:** MySQL أبطأ قليلاً من SQLite، لكنه أكثر واقعية

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
CREATE DATABASE testing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### مشكلة: Connection refused
**الحل:** تأكد من أن MySQL يعمل:
```bash
# Windows
net start mysql

# Linux/Mac
sudo service mysql start
```

