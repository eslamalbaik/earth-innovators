@extends('emails.layout')

@section('title', 'تحديث حول طلب الانضمام')

@section('header_title', 'تحديث حول طلبك')
@section('header_subtitle', 'نأسف لإعلامك بهذا القرار')

@push('styles')
<style>
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
    .rejection-reason {
        background-color: #fef2f2;
        border: 1px solid #fecaca;
        border-right: 4px solid #ef4444;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    }
    .rejection-reason h4 {
        color: #7f1d1d;
        margin-top: 0;
        margin-bottom: 10px;
    }
    .rejection-reason p {
        color: #991b1b;
        margin: 0;
        line-height: 1.8;
    }
    .encouragement {
        background-color: #e3f2fd;
        border-right: 4px solid #2196f3;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    }
    .encouragement h4 {
        color: #0c5460;
        margin-top: 0;
        margin-bottom: 15px;
    }
    .encouragement ul {
        color: #0c5460;
        line-height: 1.8;
        margin: 0;
        padding-right: 20px;
    }
    .encouragement li {
        margin-bottom: 8px;
    }
    .requirements {
        background-color: #fff3cd;
        border-right: 4px solid #ffc107;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
    }
    .requirements h4 {
        color: #856404;
        margin-top: 0;
        margin-bottom: 15px;
    }
    .requirements ul {
        color: #856404;
        line-height: 1.8;
        margin: 0;
        padding-right: 20px;
    }
    .requirements li {
        margin-bottom: 8px;
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
</style>
@endpush

@section('content')
    <div class="info-card">
        <h3>👋 مرحباً</h3>
        <p style="font-size: 18px; margin-bottom: 15px;">
            عزيزي/عزيزتي <strong>{{ $teacher->name_ar ?? $teacher->name_en ?? $teacher->user->name ?? 'المعلم' }}</strong>،
        </p>
        <p>
            نشكرك على اهتمامك بالانضمام إلى منصة معلمك. بعد مراجعة طلبك بعناية، 
            نأسف لإعلامك بأنه لا يمكن قبول طلبك في الوقت الحالي.
        </p>
    </div>

    @if($application->rejection_reason)
    <div class="rejection-reason">
        <h4>📋 سبب الرفض:</h4>
        <p>{{ $application->rejection_reason }}</p>
    </div>
    @endif

    <div class="encouragement">
        <h4>💪 لا تيأس! يمكنك التقديم مرة أخرى</h4>
        <p style="color: #0c5460; margin-bottom: 15px;">
            نشجعك على تحسين ملفك الشخصي والتقديم مرة أخرى عندما تكون مستعداً. إليك بعض النصائح:
        </p>
        <ul>
            <li>تأكد من إكمال جميع المعلومات المطلوبة بدقة</li>
            <li>أضف شهادات وخبرات إضافية</li>
            <li>تحقق من صحة جميع البيانات المدخلة</li>
            <li>أرفق صور شخصية واضحة ومهنية</li>
            <li>أضف وصفاً مفصلاً عن خبرتك وطريقة تدريسك</li>
        </ul>
    </div>

    <div class="requirements">
        <h4>📝 متطلبات الانضمام:</h4>
        <ul>
            <li>شهادة جامعية في التخصص المطلوب</li>
            <li>خبرة تدريسية لا تقل عن سنتين</li>
            <li>صور شخصية واضحة ومهنية</li>
            <li>شهادات تدريبية أو تخصصية</li>
            <li>ملف شخصي مكتمل ومفصل</li>
        </ul>
    </div>

    <div class="action-buttons">
        <a href="{{ $reapplyUrl ?? config('app.url') . '/join-teacher' }}" class="btn">
            التقديم مرة أخرى
        </a>
    </div>

    <div class="info-card">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>ملاحظة:</strong> إذا كان لديك أي استفسارات حول هذا القرار أو تحتاج إلى مساعدة في تحسين ملفك الشخصي، 
            لا تتردد في التواصل معنا. نحن هنا لمساعدتك.
        </p>
    </div>
@endsection
