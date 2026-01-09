# 🧪 كيفية تشغيل الاختبارات

## ⚡ التشغيل السريع

```bash
# جميع الاختبارات
php artisan test

# اختبارات الباقات فقط
php artisan test --filter Package
```

## 📋 الاختبارات المتاحة

### 1. Unit Tests
```bash
php artisan test tests/Unit/Services/PackageServiceTest.php
```

**عدد الاختبارات:** 17 tests

### 2. Feature Tests
```bash
# Controller Tests
php artisan test tests/Feature/PackageControllerTest.php

# Model Tests
php artisan test tests/Feature/PackageModelTest.php
php artisan test tests/Feature/UserPackageModelTest.php
```

**عدد الاختبارات:** 33+ tests

### 3. جميع اختبارات الباقات
```bash
php artisan test --filter Package
```

## 🔍 اختبارات محددة

```bash
# اختبار محدد
php artisan test --filter test_can_create_package

# Unit Tests فقط
php artisan test tests/Unit

# Feature Tests فقط
php artisan test tests/Feature
```

## 📊 Coverage Report

```bash
php artisan test --coverage
```

## ✅ التحقق من النجاح

بعد التشغيل، يجب أن ترى:
```
PASS  Tests\Unit\Services\PackageServiceTest
  ✓ can create package
  ✓ can update package
  ... (17 tests)

PASS  Tests\Feature\PackageControllerTest
  ✓ admin can view packages index
  ... (15 tests)

Tests:    32 passed
Duration: 2.5s
```

## 🐛 استكشاف الأخطاء

### مشكلة: Unknown database 'testing'
**الحل:** تم تحديث phpunit.xml لاستخدام SQLite في الذاكرة. لا حاجة لقاعدة بيانات منفصلة.

### مشكلة: Factory not found
**الحل:** تم إنشاء Factories. تأكد من وجود `HasFactory` trait في Models.

### مشكلة: Migrations not found
**الحل:** الاختبارات تستخدم `RefreshDatabase` الذي يشغل migrations تلقائياً.

## 📝 ملاحظات

- ✅ جميع الاختبارات تستخدم SQLite في الذاكرة
- ✅ لا حاجة لإعداد قاعدة بيانات منفصلة
- ✅ الاختبارات نظيفة بعد كل تشغيل
- ✅ سريعة في التنفيذ









