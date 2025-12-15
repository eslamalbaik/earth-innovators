@extends('emails.layout')

@section('title', 'رمز التحقق')

@section('header_title', 'رمز التحقق')
@section('header_subtitle', 'تأكيد بريدك الإلكتروني')

@push('styles')
<style>
    .otp-container {
        text-align: center;
        margin: 30px 0;
    }
    .otp-code {
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        font-size: 36px;
        font-weight: 700;
        padding: 20px 40px;
        border-radius: 12px;
        letter-spacing: 8px;
        box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3);
        margin: 20px 0;
    }
    .info-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        border-right: 4px solid #fbbf24;
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
</style>
@endpush

@section('content')
    <div class="info-card">
        <p style="font-size: 18px; margin-bottom: 15px;">مرحباً! 👋</p>
        <p>لقد طلبت رمز التحقق لتأكيد بريدك الإلكتروني.</p>
    </div>

    <div class="otp-container">
        <p style="font-size: 16px; color: #6b7280; margin-bottom: 10px;">رمز التحقق الخاص بك:</p>
        <div class="otp-code">{{ $code }}</div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">يرجى إدخال هذا الرمز في صفحة التحقق</p>
    </div>

    <div class="warning-box">
        <p><strong>⚠️ تنبيه:</strong> هذا الرمز صالح لمدة <strong>{{ $expiryMinutes ?? 10 }} دقائق</strong> فقط</p>
    </div>

    <div class="info-card">
        <p style="font-size: 14px; color: #6b7280;">
            <strong>ملاحظة مهمة:</strong> إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان. 
            لا تشارك هذا الرمز مع أي شخص آخر.
        </p>
    </div>
@endsection

