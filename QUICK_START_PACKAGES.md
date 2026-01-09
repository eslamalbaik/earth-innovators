# 🚀 دليل التشغيل السريع - نظام الباقات مع Ziina

## الخطوات السريعة للبدء

### 1️⃣ إضافة متغيرات البيئة

أضف هذه الأسطر إلى ملف `.env`:

```env
# Ziina Payment Gateway
ZIINA_API_KEY=X9/fD/i0a/tMsFNdtyOytEgEP4r0/J6KwjEr1TJaeL39JYHUaOKq7+YSfMyP32ev
ZIINA_WEBHOOK_SECRET=
ZIINA_TEST_MODE=true
```

### 2️⃣ تشغيل Seeder لإنشاء الباقات

```bash
php artisan db:seed --class=PackagesSeeder
```

سيتم إنشاء 4 باقات:
- ✅ باقة الطالب (29 AED)
- ✅ باقة المدرس (99 AED) ⭐
- ✅ باقة المدرسة (499 AED)
- ✅ باقة المؤسسة التعليمية (1499 AED)

### 3️⃣ بناء Frontend

```bash
npm run build
# أو للتطوير
npm run dev
```

### 4️⃣ اختبار النظام

1. **للمستخدمين - عرض الباقات:**
   ```
   http://localhost/packages
   ```

2. **للمستخدمين - اشتراكاتي:**
   ```
   http://localhost/my-subscriptions
   ```

3. **للمسؤولين - إدارة الباقات:**
   ```
   http://localhost/admin/packages
   ```

---

## 🔧 إعداد Ziina Webhook (مهم!)

لكي تعمل عمليات الدفع بشكل صحيح، يجب إعداد Webhook في لوحة تحكم Ziina:

1. سجل الدخول إلى [لوحة تحكم Ziina](https://dashboard.ziina.com)
2. اذهب إلى: **Settings > Webhooks**
3. أضف Webhook URL الجديد:
   ```
   https://yourdomain.com/webhook/ziina
   ```
4. اختر الأحداث:
   - ✅ `payment_request.paid`
   - ✅ `payment_request.failed`
   - ✅ `payment_request.cancelled`
5. احفظ Webhook Secret وأضفه إلى `.env`:
   ```env
   ZIINA_WEBHOOK_SECRET=your_webhook_secret_here
   ```

---

## 📋 الروابط المهمة

### للمستخدمين:
- **عرض الباقات:** `/packages`
- **اشتراكاتي:** `/my-subscriptions`

### للمسؤولين:
- **إدارة الباقات:** `/admin/packages`
- **إضافة باقة:** `/admin/packages/create`
- **عرض المشتركين:** `/admin/packages/{id}/subscribers`

---

## ✅ التحقق من التثبيت

### تحقق من وجود الملفات:

```bash
# Backend
ls -la app/Services/ZiinaService.php
ls -la app/Http/Controllers/PackageSubscriptionController.php
ls -la app/Http/Controllers/Api/ZiinaWebhookController.php

# Frontend
ls -la resources/js/Pages/Packages/Index.jsx
ls -la resources/js/Pages/Packages/MySubscriptions.jsx

# Seeder
ls -la database/seeders/PackagesSeeder.php
```

### تحقق من Routes:

```bash
php artisan route:list | grep packages
```

يجب أن ترى:
- `GET|HEAD  packages`
- `POST      packages/{package}/subscribe`
- `GET|HEAD  my-subscriptions`
- `POST      webhook/ziina`

---

## 🧪 اختبار الدفع

### في وضع الاختبار (Test Mode):

1. اذهب إلى `/packages`
2. اختر باقة واضغط "اشترك الآن"
3. سيتم توجيهك إلى صفحة دفع Ziina التجريبية
4. استخدم بطاقة اختبار من Ziina
5. أكمل عملية الدفع
6. سيتم توجيهك للموقع مع تفعيل الاشتراك

---

## 🐛 حل المشاكل الشائعة

### المشكلة: خطأ 500 عند الدفع

**الحل:**
```bash
# تحقق من Logs
tail -f storage/logs/laravel.log

# تحقق من API Key
php artisan tinker
>>> config('services.ziina.api_key')
```

### المشكلة: الباقات لا تظهر

**الحل:**
```bash
# تحقق من الباقات في قاعدة البيانات
php artisan tinker
>>> \App\Models\Package::count()
>>> \App\Models\Package::all()

# إذا كانت فارغة، شغل Seeder مرة أخرى
php artisan db:seed --class=PackagesSeeder
```

### المشكلة: Webhook لا يعمل

**الحل:**
1. تأكد من إضافة Webhook URL في لوحة تحكم Ziina
2. تأكد من أن الموقع accessible من الإنترنت
3. راجع Logs: `storage/logs/laravel.log`

---

## 📊 هيكل قاعدة البيانات

### الجداول المستخدمة:

```sql
-- الباقات
packages (id, name, name_ar, price, currency, features, ...)

-- اشتراكات المستخدمين
user_packages (id, user_id, package_id, status, start_date, end_date, ...)

-- المدفوعات
payments (id, student_id, amount, status, gateway_payment_id, ...)
```

---

## 🎯 الخطوات التالية

بعد التثبيت والاختبار:

1. ✅ اختبار عملية الدفع كاملة
2. ✅ إعداد Webhook في Ziina
3. ✅ اختبار جميع حالات الدفع (نجاح، فشل، إلغاء)
4. ✅ مراجعة Logs
5. ✅ عند الاستعداد: تغيير `ZIINA_TEST_MODE=false`

---

## 📞 الدعم

في حال واجهت أي مشاكل:

1. راجع ملف `ZIINA_PACKAGES_INTEGRATION.md` للتفاصيل الكاملة
2. راجع Logs: `storage/logs/laravel.log`
3. راجع [توثيق Ziina API](https://docs.ziina.com)

---

## ✨ النظام جاهز!

تم إنشاء نظام متكامل للباقات والاشتراكات مع الربط ببوابة دفع Ziina. 

**استمتع باستقبال الاشتراكات! 🎉**

