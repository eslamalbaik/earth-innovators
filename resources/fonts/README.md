# خطوط الشهادات (Certificate fonts)

ضع هنا ملفات خط **Tajawal** ليُستخدم في توليد شهادات الـ PDF:

- `Tajawal-Regular.ttf`
- `Tajawal-Bold.ttf`

يقوم `CertificateService::resolveArabicFonts()` بتسجيلها تلقائياً في TCPDF عند أول توليد.
إذا لم تكن الملفات موجودة، يرجع النظام تلقائياً إلى خط `DejaVu Sans` دون أي خطأ.

## التنزيل (من مستودع Google Fonts)

```bash
cd resources/fonts
wget -O Tajawal-Regular.ttf https://github.com/google/fonts/raw/main/ofl/tajawal/Tajawal-Regular.ttf
wget -O Tajawal-Bold.ttf    https://github.com/google/fonts/raw/main/ofl/tajawal/Tajawal-Bold.ttf
```

> ملاحظة: يحتاج TCPDF صلاحية كتابة على مجلد `vendor/tecnickcom/tcpdf/fonts/` عند أول تسجيل للخط.
