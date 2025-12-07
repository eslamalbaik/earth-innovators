# إعداد نظام الإشعارات - Redis + Laravel Echo Server

## 📋 المتطلبات

1. **Redis** - يجب تثبيته وتشغيله
2. **Node.js** - لإدارة Laravel Echo Server
3. **Laravel Echo Server** - للـ WebSocket connections

## 🚀 خطوات الإعداد

### 1. تثبيت Redis

#### Windows:
```bash
# تحميل Redis من: https://github.com/microsoftarchive/redis/releases
# أو استخدام WSL
wsl sudo apt-get install redis-server
```

#### Linux/Mac:
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# Mac
brew install redis
```

#### تشغيل Redis:
```bash
# Windows (WSL)
wsl redis-server

# Linux/Mac
redis-server
```

### 2. تثبيت Laravel Echo Server

```bash
npm install -g laravel-echo-server
```

### 3. إعداد Laravel Echo Server

تم إنشاء ملف `laravel-echo-server.json` في جذر المشروع. يمكنك تعديله حسب احتياجاتك:

```json
{
    "authHost": "http://localhost",
    "authEndpoint": "/broadcasting/auth",
    "port": "6001",
    "database": "redis",
    "databaseConfig": {
        "redis": {
            "host": "127.0.0.1",
            "port": "6379"
        }
    }
}
```

### 4. إعداد ملف .env

أضف/حدث هذه المتغيرات في ملف `.env`:

```env
# Broadcasting
BROADCAST_DRIVER=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Laravel Echo Server (للـ Frontend)
VITE_ECHO_HOST=localhost
VITE_ECHO_PORT=6001
VITE_ECHO_SERVER_URL=http://localhost:6001
```

### 5. تثبيت الحزم المطلوبة

```bash
# Backend (Laravel)
composer install

# Frontend
npm install
npm install socket.io-client
```

### 6. تشغيل Laravel Echo Server

```bash
# في terminal منفصل
laravel-echo-server start
```

أو يمكنك إضافته إلى `package.json` scripts:

```json
{
  "scripts": {
    "echo-server": "laravel-echo-server start",
    "dev": "concurrently \"npm run dev\" \"laravel-echo-server start\" \"php artisan serve\""
  }
}
```

### 7. تشغيل Queue Worker

```bash
php artisan queue:work
```

أو في development:

```bash
php artisan queue:listen
```

## 🔍 اختبار النظام

### 1. التحقق من Redis:
```bash
redis-cli ping
# يجب أن يعيد: PONG
```

### 2. التحقق من Laravel Echo Server:
افتح المتصفح على: `http://localhost:6001`

يجب أن ترى صفحة Laravel Echo Server.

### 3. اختبار الإشعارات:

1. افتح لوحة تحكم الطالب/المعلم/المدرسة
2. افتح Developer Console (F12)
3. أنشئ تحدياً جديداً أو قيّم تسليماً
4. يجب أن ترى في Console:
   - `✅ Echo connected successfully`
   - `📬 New notification received via Echo`
   - `✅ Processed notification`

## 📊 Logging

جميع الإشعارات تُسجل في:
- `storage/logs/notifications.log` - ملف مخصص للإشعارات
- `storage/logs/laravel.log` - السجل العام

يمكنك مراقبة الإشعارات في الوقت الفعلي:

```bash
# Linux/Mac
tail -f storage/logs/notifications.log

# Windows
Get-Content storage/logs/notifications.log -Wait
```

## 🐛 حل المشاكل

### المشكلة: Echo لا يتصل
**الحل:**
1. تأكد من أن Redis يعمل: `redis-cli ping`
2. تأكد من أن Laravel Echo Server يعمل على المنفذ 6001
3. تحقق من إعدادات `.env`
4. افتح Console في المتصفح للتحقق من الأخطاء

### المشكلة: الإشعارات لا تظهر
**الحل:**
1. تحقق من `storage/logs/notifications.log`
2. تأكد من أن Queue Worker يعمل
3. تحقق من أن الأحداث تُطلق بشكل صحيح
4. افتح Network tab في Developer Tools للتحقق من `/broadcasting/auth`

### المشكلة: CORS errors
**الحل:**
تأكد من أن `laravel-echo-server.json` يحتوي على:
```json
"apiOriginAllow": {
    "allowCors": true,
    "allowOrigin": "*"
}
```

## 📝 ملاحظات

- النظام يستخدم **polling** كـ fallback إذا فشل WebSocket connection
- الإشعارات تُحفظ في قاعدة البيانات حتى لو فشل broadcasting
- جميع الإشعارات تُسجل بشكل شامل للمساعدة في التصحيح

## 🎯 الأحداث المدعومة

- ✅ Challenge Created
- ✅ Challenge Submission Reviewed
- ✅ Challenge Evaluation Created
- ✅ Publication Published
- ✅ Project Evaluated
- ✅ Badge Awarded
- ✅ Example Published (قريباً)

