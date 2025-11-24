# نظام الإشعارات - دليل الإعداد

## ✅ ما تم إصلاحه

### 1. Backend Fixes
- ✅ إصلاح `NotificationController` لدعم JSON responses
- ✅ تحسين `NotificationService` مع error handling أفضل
- ✅ إضافة ShouldBroadcast لجميع الإشعارات
- ✅ إصلاح جميع Notification classes
- ✅ إضافة routes/channels.php للـ broadcasting
- ✅ إضافة CSRF token في app.blade.php

### 2. Frontend Fixes
- ✅ إضافة Laravel Echo و Pusher.js setup
- ✅ إضافة real-time listeners في DashboardLayout
- ✅ تحسين عرض الإشعارات في dropdown
- ✅ إضافة fallback إلى polling إذا لم يكن Pusher متاحاً
- ✅ إصلاح نظام قراءة/عدم قراءة الإشعارات

### 3. Notification Classes
- ✅ `ProjectEvaluatedNotification` - إشعار عند تقييم المشروع
- ✅ `NewProjectNotification` - إشعار عند إنشاء مشروع جديد
- ✅ `BadgeAwardedNotification` - إشعار عند منح شارة
- ✅ `NewPublicationNotification` - إشعار عند نشر مقال
- ✅ `TeacherProjectCreatedNotification` - إشعار عند إنشاء معلم مشروع

## 📦 التثبيت

### 1. تثبيت الحزم المطلوبة

```bash
npm install laravel-echo pusher-js
```

### 2. إعداد Pusher (اختياري - للـ real-time)

أضف إلى `.env`:

```env
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_app_id
PUSHER_APP_KEY=your_app_key
PUSHER_APP_SECRET=your_app_secret
PUSHER_APP_CLUSTER=mt1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
```

### 3. إعداد Broadcasting (بدون Pusher)

إذا لم تكن تريد استخدام Pusher، يمكنك استخدام `log` أو `null` driver:

```env
BROADCAST_DRIVER=log
```

سيستخدم النظام polling كـ fallback.

## 🔧 الإعدادات

### Routes
تم إضافة routes في `routes/web.php`:
- `GET /notifications` - جلب جميع الإشعارات
- `GET /notifications/unread-count` - عدد الإشعارات غير المقروءة
- `POST /notifications/{id}/read` - تحديد إشعار كمقروء
- `POST /notifications/mark-all-read` - تحديد جميع الإشعارات كمقروءة

### Channels
تم إضافة `routes/channels.php` للـ broadcasting authorization.

## 🎯 سيناريوهات الإشعارات

### 1. تقييم مشروع طالب
- **المشغل**: `SubmissionService@evaluateSubmission`
- **الإشعار**: `ProjectEvaluatedNotification`
- **المستقبل**: الطالب
- **الوظيفة**: يرسل إشعار للطالب عند تقييم مشروعه

### 2. إنشاء مشروع جديد
- **المشغل**: `SchoolProjectController@store` أو `SchoolProjectController@approve`
- **الإشعار**: `NewProjectNotification`
- **المستقبل**: جميع الطلاب والمعلمين في المدرسة
- **الوظيفة**: يرسل إشعار عند إنشاء أو قبول مشروع جديد

### 3. إنشاء معلم مشروع
- **المشغل**: `TeacherProjectController@store`
- **الإشعار**: `TeacherProjectCreatedNotification`
- **المستقبل**: المدرسة
- **الوظيفة**: يرسل إشعار للمدرسة عند إنشاء معلم مشروع

### 4. منح شارة
- **المشغل**: `BadgeService@awardBadge` أو `SubmissionService@evaluateSubmission`
- **الإشعار**: `BadgeAwardedNotification`
- **المستقبل**: الطالب
- **الوظيفة**: يرسل إشعار عند منح شارة للطالب

### 5. نشر مقال
- **المشغل**: `PublicationService@create` أو `SchoolPublicationController@approve`
- **الإشعار**: `NewPublicationNotification`
- **المستقبل**: جميع الطلاب والمعلمين في المدرسة
- **الوظيفة**: يرسل إشعار عند نشر مقال جديد

## 🧪 الاختبار

### اختبار الإشعارات يدوياً:

1. **تقييم مشروع**:
   - سجل دخول كمدرسة أو معلم
   - قم بتقييم مشروع طالب
   - تحقق من ظهور الإشعار في لوحة الطالب

2. **إنشاء مشروع**:
   - سجل دخول كمدرسة
   - أنشئ مشروع جديد أو اقبل مشروع معلق
   - تحقق من ظهور الإشعار في لوحة الطلاب والمعلمين

3. **منح شارة**:
   - سجل دخول كمدرسة أو معلم
   - قم بمنح شارة لطالب
   - تحقق من ظهور الإشعار في لوحة الطالب

## 📝 Logging

تم إضافة logging شامل لتتبع:
- محاولات إرسال الإشعارات
- الأخطاء في إرسال الإشعارات
- تحديث حالة الإشعارات (قراءة/عدم قراءة)

يمكنك مراجعة `storage/logs/laravel.log` لتتبع الإشعارات.

## 🔍 Troubleshooting

### الإشعارات لا تظهر
1. تحقق من أن `BROADCAST_DRIVER` مضبوط بشكل صحيح
2. تحقق من أن Pusher credentials صحيحة (إذا كنت تستخدم Pusher)
3. تحقق من console في المتصفح للأخطاء
4. تحقق من `storage/logs/laravel.log` للأخطاء

### Real-time لا يعمل
1. تأكد من تثبيت `laravel-echo` و `pusher-js`
2. تحقق من أن `VITE_PUSHER_APP_KEY` موجود في `.env`
3. إذا لم يكن Pusher متاحاً، سيستخدم النظام polling كل 30 ثانية

### الإشعارات لا تُحفظ في قاعدة البيانات
1. تحقق من أن جدول `notifications` موجود
2. تحقق من أن `User` model يستخدم `Notifiable` trait
3. تحقق من migrations

## 📚 الملفات المعدلة

### Backend
- `app/Http/Controllers/NotificationController.php`
- `app/Services/NotificationService.php`
- `app/Notifications/*.php` (جميع فئات الإشعارات)
- `routes/channels.php` (جديد)
- `bootstrap/app.php`

### Frontend
- `resources/js/bootstrap.js`
- `resources/js/Layouts/DashboardLayout.jsx`
- `resources/views/app.blade.php`
- `package.json`

## ✅ Checklist

- [x] إصلاح NotificationController
- [x] إصلاح NotificationService
- [x] إضافة ShouldBroadcast لجميع الإشعارات
- [x] إضافة Echo setup في frontend
- [x] إضافة real-time listeners
- [x] إصلاح عرض الإشعارات
- [x] إضافة fallback إلى polling
- [x] إضافة logging
- [x] إضافة error handling
- [x] إضافة documentation

## 🚀 الخطوات التالية

1. قم بتثبيت الحزم: `npm install`
2. أضف Pusher credentials إلى `.env` (اختياري)
3. قم ببناء assets: `npm run build`
4. اختبر النظام

