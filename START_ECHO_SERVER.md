# تشغيل Laravel Echo Server

## المشكلة
إذا رأيت خطأ `ERR_CONNECTION_REFUSED` على `localhost:6001`، فهذا يعني أن Laravel Echo Server غير قيد التشغيل.

## الحل

### 1. تأكد من أن Redis يعمل

#### على Windows:
- **الخيار 1**: استخدم WSL (Windows Subsystem for Linux) لتشغيل Redis
  ```bash
  wsl
  sudo apt-get update
  sudo apt-get install redis-server
  redis-server
  ```

- **الخيار 2**: استخدم Docker
  ```bash
  docker run -d -p 6379:6379 redis:latest
  ```

- **الخيار 3**: استخدم Memurai (بديل Redis لـ Windows)
  - قم بتحميله من: https://www.memurai.com/
  - بعد التثبيت، سيعمل تلقائياً على المنفذ 6379

#### على Linux/Mac:
```bash
redis-server
```

### 2. شغّل Laravel Echo Server

في terminal منفصل، قم بتشغيل:

```bash
npm run echo-server
```

أو:

```bash
laravel-echo-server start
```

### 3. تأكد من أن Laravel Queue Worker يعمل

في terminal منفصل آخر:

```bash
php artisan queue:work
```

أو:

```bash
php artisan queue:listen
```

## تشغيل كل شيء معاً

يمكنك استخدام:

```bash
npm run dev:full
```

هذا سيشغّل:
- Vite dev server
- Laravel Echo Server
- Laravel development server
- Queue worker

## ملاحظات

- **الإشعارات ستعمل حتى بدون Laravel Echo Server**: النظام يستخدم polling كـ fallback (كل 10 ثوانٍ)
- **الأخطاء في Console**: تم تحسين معالجة الأخطاء لتجاهل أخطاء الاتصال بشكل صامت
- **Redis ضروري**: Laravel Echo Server يحتاج Redis للعمل

## التحقق من أن كل شيء يعمل

1. **Redis**: افتح terminal جديد واكتب `redis-cli ping` (يجب أن يعيد `PONG`)
2. **Laravel Echo Server**: يجب أن ترى رسالة في terminal تقول "Server ready!"
3. **Queue Worker**: يجب أن ترى رسالة "Processing jobs..."

## استكشاف الأخطاء

### Redis لا يعمل:
```bash
# تحقق من أن Redis يعمل
redis-cli ping
# يجب أن يعيد: PONG
```

### Laravel Echo Server لا يعمل:
```bash
# تحقق من أن المنفذ 6001 متاح
netstat -ano | findstr :6001  # Windows
lsof -i :6001                  # Linux/Mac
```

### Queue Worker لا يعمل:
```bash
# تأكد من أن BROADCAST_DRIVER=redis في .env
# ثم شغّل:
php artisan queue:work
```

