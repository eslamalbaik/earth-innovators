# 🧪 دليل الاختبارات الشامل لنظام الباقات

## 📋 نظرة عامة

هذا الدليل يشرح كيفية تشغيل الاختبارات الشاملة لنظام إدارة الباقات.

## 🎯 أنواع الاختبارات

### 1. Unit Tests (اختبارات الوحدة)
**الموقع:** `tests/Unit/Services/PackageServiceTest.php`

**الغرض:** اختبار منطق الأعمال في `PackageService`

**التغطية:**
- ✅ إنشاء باقة
- ✅ تحديث باقة
- ✅ حذف باقة
- ✅ الحصول على الباقات مع الفلترة
- ✅ إحصائيات الباقات
- ✅ إدارة المشتركين
- ✅ Caching

**التشغيل:**
```bash
php artisan test --filter PackageServiceTest
# أو
php artisan test tests/Unit/Services/PackageServiceTest.php
```

### 2. Feature Tests (اختبارات الميزات)
**الموقع:** `tests/Feature/PackageControllerTest.php`

**الغرض:** اختبار جميع HTTP endpoints والتفاعلات

**التغطية:**
- ✅ عرض قائمة الباقات
- ✅ إنشاء باقة جديدة
- ✅ تعديل باقة
- ✅ حذف باقة
- ✅ تفعيل/تعطيل باقة
- ✅ عرض المشتركين
- ✅ إدارة الاشتراكات
- ✅ البحث والفلترة
- ✅ Authorization

**التشغيل:**
```bash
php artisan test --filter PackageControllerTest
# أو
php artisan test tests/Feature/PackageControllerTest.php
```

### 3. Integration Tests (اختبارات التكامل)
**الموقع:** 
- `tests/Feature/PackageModelTest.php`
- `tests/Feature/UserPackageModelTest.php`

**الغرض:** اختبار العلاقات والسلوكيات في Models

**التغطية:**
- ✅ علاقات Package مع Users
- ✅ Casting للبيانات
- ✅ Validation
- ✅ Cascade Deletes

**التشغيل:**
```bash
php artisan test --filter PackageModelTest
php artisan test --filter UserPackageModelTest
```

### 4. Browser Tests (اختبارات المتصفح)
**الموقع:** `tests/Browser/PackageBrowserTest.php`

**الغرض:** اختبار UI والتفاعلات في المتصفح

**ملاحظة:** يتطلب Laravel Dusk

**التشغيل:**
```bash
php artisan dusk
# أو
php artisan dusk --filter PackageBrowserTest
```

## 🚀 تشغيل جميع الاختبارات

### تشغيل جميع الاختبارات
```bash
php artisan test
```

### تشغيل اختبارات الباقات فقط
```bash
php artisan test --filter Package
```

### تشغيل مع Coverage
```bash
php artisan test --coverage
```

### تشغيل اختبارات محددة
```bash
# Unit Tests فقط
php artisan test tests/Unit

# Feature Tests فقط
php artisan test tests/Feature

# اختبار محدد
php artisan test --filter test_can_create_package
```

## 📊 إحصائيات الاختبارات

### عدد الاختبارات
- **Unit Tests:** 20+ test cases
- **Feature Tests:** 15+ test cases
- **Integration Tests:** 10+ test cases
- **Browser Tests:** 6+ test cases

### التغطية المتوقعة
- **PackageService:** 95%+
- **PackageController:** 90%+
- **Models:** 85%+

## 🔧 الإعداد

### 1. إعداد قاعدة البيانات للاختبار
```bash
# إنشاء قاعدة بيانات testing
php artisan migrate --database=testing

# أو استخدام SQLite في الذاكرة
```

### 2. إعداد .env.testing
```env
APP_ENV=testing
DB_DATABASE=testing
DB_CONNECTION=sqlite
```

### 3. تشغيل Migrations
```bash
php artisan migrate --env=testing
```

## ✅ Checklist قبل الإطلاق

- [ ] جميع Unit Tests تمر بنجاح
- [ ] جميع Feature Tests تمر بنجاح
- [ ] جميع Integration Tests تمر بنجاح
- [ ] Browser Tests تعمل على Chrome
- [ ] Browser Tests تعمل على Firefox
- [ ] Browser Tests تعمل على Safari (Mac)
- [ ] Responsive Design يعمل على Mobile
- [ ] RTL Support يعمل بشكل صحيح
- [ ] لا توجد أخطاء في Console
- [ ] Performance مقبول (< 2s للصفحة)

## 🐛 استكشاف الأخطاء

### مشكلة: الاختبارات تفشل
```bash
# تنظيف Cache
php artisan cache:clear
php artisan config:clear

# إعادة تشغيل Migrations
php artisan migrate:fresh --env=testing
```

### مشكلة: Factory not found
```bash
# التأكد من وجود HasFactory trait في Models
# Package.php و UserPackage.php
```

### مشكلة: Database errors
```bash
# التأكد من إعدادات قاعدة البيانات في phpunit.xml
# التأكد من وجود قاعدة بيانات testing
```

## 📝 ملاحظات

- جميع الاختبارات تستخدم `RefreshDatabase` لضمان نظافة البيانات
- Cache يتم مسحه قبل كل اختبار
- Factories تستخدم بيانات واقعية
- الاختبارات متوافقة مع Laravel 12

## 🎉 النتيجة

بعد تشغيل جميع الاختبارات، يجب أن تحصل على:
- ✅ جميع الاختبارات تمر بنجاح
- ✅ Coverage عالي (> 85%)
- ✅ لا توجد أخطاء
- ✅ النظام جاهز للإطلاق









