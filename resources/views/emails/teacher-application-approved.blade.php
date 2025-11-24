@extends('emails.layout')

@section('title', 'تم قبول طلب الانضمام')

@section('header_title', 'تم قبول طلبك! 🎉')
@section('header_subtitle', 'مرحباً بك في منصة معلمك')

@push('styles')
<style>
    .success-badge {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        text-align: center;
        margin: 30px 0;
        font-size: 18px;
        font-weight: 600;
    }
    .info-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 25px;
        margin-bottom: 20px;
        border-right: 4px solid #fbbf24;
    }
    .info-card h3 {
        color: #1f2937;
        margin-bottom: 20px;
        font-size: 20px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .info-card p {
        color: #1f2937;
        line-height: 1.8;
        margin: 10px 0;
    }
    .btn {
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white !important;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 10px 5px;
        font-size: 16px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3);
    }
    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(251, 191, 36, 0.4);
    }
    .action-buttons {
        text-align: center;
        margin: 30px 0;
    }
    .next-steps {
        background-color: #e3f2fd;
        border-right: 4px solid #2196f3;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    }
    .next-steps h4 {
        color: #0c5460;
        margin-top: 0;
        margin-bottom: 15px;
    }
    .next-steps ul {
        color: #0c5460;
        line-height: 1.8;
        margin: 0;
        padding-right: 20px;
    }
    .next-steps li {
        margin-bottom: 8px;
    }
</style>
@endpush

@section('content')
    <div class="success-badge">
        ✅ تم قبول طلبك بنجاح!
    </div>

    <div class="info-card">
        <h3>🎉 تهانينا!</h3>
        <p style="font-size: 18px; margin-bottom: 15px;">
            عزيزي/عزيزتي <strong>{{ $teacher->name_ar ?? $teacher->name_en ?? $teacher->user->name ?? 'المعلم' }}</strong>،
        </p>
        <p>
            نحن سعداء بإعلامك بأنه تم قبول طلبك للانضمام إلى منصة معلمك. 
            يمكنك الآن البدء في استقبال طلبات الحجز من الطلاب وبناء مسيرتك التعليمية معنا.
        </p>
    </div>

    <div class="next-steps">
        <h4>📝 الخطوات التالية:</h4>
        <ul>
            <li>قم بتسجيل الدخول إلى حسابك</li>
            <li>أكمل ملفك الشخصي وأضف جميع المعلومات المطلوبة</li>
            <li>حدد مواعيدك المتاحة للتدريس</li>
            <li>ابدأ في استقبال طلبات الحجز من الطلاب</li>
            <li>راجع لوحة التحكم بانتظام لمتابعة حجوزاتك</li>
        </ul>
    </div>

    <div class="action-buttons">
        <a href="{{ $loginUrl ?? config('app.url') . '/login' }}" class="btn">
            تسجيل الدخول الآن
        </a>
        <a href="{{ $dashboardUrl ?? config('app.url') . '/teacher/dashboard' }}" class="btn">
            الانتقال إلى لوحة التحكم
        </a>
    </div>

    <div class="info-card">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>ملاحظة:</strong> إذا كان لديك أي استفسارات أو تحتاج إلى مساعدة، لا تتردد في التواصل معنا. 
            نحن هنا لمساعدتك في كل خطوة من رحلتك التعليمية.
        </p>
    </div>
@endsection
