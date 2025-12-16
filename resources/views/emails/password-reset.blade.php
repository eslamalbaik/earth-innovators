@extends('emails.layout')

@section('title', 'إعادة تعيين كلمة المرور')

@section('header_title', 'إعادة تعيين كلمة المرور')
@section('header_subtitle', 'تأكيد طلب تغيير كلمة المرور')

@push('styles')
<style>
    .button-container {
        text-align: center;
        margin: 30px 0;
    }
    .reset-button {
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        font-size: 18px;
        font-weight: 600;
        padding: 18px 40px;
        border-radius: 10px;
        text-decoration: none;
        box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
        transition: transform 0.2s;
    }
    .reset-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(59, 130, 246, 0.4);
    }
    .info-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        border-right: 4px solid #3b82f6;
    }
    .info-card p {
        color: #1f2937;
        line-height: 1.8;
        margin: 10px 0;
    }
    .warning-box {
        background-color: #fff3cd;
        border: 1px solid #ffc107;
        border-right: 4px solid #ffc107;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
    }
    .warning-box p {
        color: #856404;
        margin: 0;
        font-size: 14px;
    }
    .link-fallback {
        background-color: #e5e7eb;
        border-radius: 8px;
        padding: 15px;
        margin: 20px 0;
        word-break: break-all;
        font-size: 12px;
        color: #6b7280;
    }
</style>
@endpush

@section('content')
    @if($name)
    <div class="info-card">
        <p style="font-size: 18px; margin-bottom: 15px;">مرحباً {{ $name }}! 👋</p>
    </div>
    @else
    <div class="info-card">
        <p style="font-size: 18px; margin-bottom: 15px;">مرحباً! 👋</p>
    </div>
    @endif

    <div class="info-card">
        <p>لقد طلبت إعادة تعيين كلمة المرور لحسابك.</p>
        <p>انقر على الزر أدناه لإعادة تعيين كلمة المرور الخاصة بك:</p>
    </div>

    <div class="button-container">
        <a href="{{ $resetUrl }}" class="reset-button">إعادة تعيين كلمة المرور</a>
    </div>

    <div class="warning-box">
        <p><strong>⚠️ تنبيه:</strong> رابط إعادة التعيين صالح لمدة <strong>{{ $expiryMinutes }} دقيقة</strong> فقط ويمكن استخدامه مرة واحدة فقط</p>
    </div>

    <div class="link-fallback">
        <p><strong>إذا لم يعمل الزر، انسخ والصق الرابط التالي في المتصفح:</strong></p>
        <p style="margin-top: 10px;">{{ $resetUrl }}</p>
    </div>

    <div class="info-card">
        <p style="font-size: 14px; color: #6b7280;">
            <strong>ملاحظة مهمة:</strong> إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. 
            لا تشارك رابط إعادة التعيين مع أي شخص آخر.
        </p>
    </div>
@endsection

