@extends('emails.layout')

@section('title', 'طلب انضمام معلم جديد')

@section('header_title', 'طلب انضمام جديد')
@section('header_subtitle', 'معلم جديد يريد الانضمام للمنصة')

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
    .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
        border-bottom: none;
    }
    .info-label {
        font-weight: 600;
        color: #6b7280;
        font-size: 14px;
    }
    .info-value {
        color: #1f2937;
        font-weight: 500;
        font-size: 15px;
        text-align: left;
    }
    .btn {
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white !important;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 20px 0;
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
    .highlight {
        color: #f59e0b;
        font-weight: 700;
    }
    @media only screen and (max-width: 600px) {
        .info-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 5px;
        }
        .info-value {
            text-align: right;
        }
    }
</style>
@endpush

@section('content')
    <div class="info-card">
        <h3>👋 مرحباً {{ $notifiable->name ?? 'المدير' }}</h3>
        <p style="color: #1f2937; line-height: 1.8; margin-bottom: 15px;">
            تم استلام طلب انضمام جديد من معلم يريد الانضمام إلى منصة معلمك.
        </p>
    </div>

    <div class="info-card">
        <h3>👨‍🏫 معلومات المعلم</h3>
        <div class="info-row">
            <span class="info-label">الاسم:</span>
            <span class="info-value">{{ $teacher->name_ar ?? $teacher->name_en ?? $teacher->user->name ?? 'غير متوفر' }}</span>
        </div>
        @if($teacher->user && $teacher->user->email)
        <div class="info-row">
            <span class="info-label">البريد الإلكتروني:</span>
            <span class="info-value">{{ $teacher->user->email }}</span>
        </div>
        @endif
        @if($teacher->user && $teacher->user->phone)
        <div class="info-row">
            <span class="info-label">رقم الجوال:</span>
            <span class="info-value">{{ $teacher->user->phone }}</span>
        </div>
        @endif
        @if($teacher->city)
        <div class="info-row">
            <span class="info-label">المدينة:</span>
            <span class="info-value">{{ $teacher->city }}</span>
        </div>
        @endif
        @if($teacher->neighborhoods && is_array($teacher->neighborhoods))
        <div class="info-row">
            <span class="info-label">الأحياء:</span>
            <span class="info-value">{{ implode(', ', $teacher->neighborhoods) }}</span>
        </div>
        @endif
        @if($teacher->subjects && is_array($teacher->subjects))
        <div class="info-row">
            <span class="info-label">المواد:</span>
            <span class="info-value">{{ implode(', ', $teacher->subjects) }}</span>
        </div>
        @endif
        @if($teacher->stages && is_array($teacher->stages))
        <div class="info-row">
            <span class="info-label">المراحل:</span>
            <span class="info-value">{{ implode(', ', $teacher->stages) }}</span>
        </div>
        @endif
        @if($teacher->price_per_hour)
        <div class="info-row">
            <span class="info-label">السعر لكل ساعة:</span>
            <span class="info-value highlight">{{ number_format($teacher->price_per_hour, 2) }} ريال</span>
        </div>
        @endif
        @if($teacher->experience_years)
        <div class="info-row">
            <span class="info-label">سنوات الخبرة:</span>
            <span class="info-value">{{ $teacher->experience_years }} سنة</span>
        </div>
        @endif
    </div>

    <div class="action-buttons">
        <a href="{{ url('/admin/teacher-applications') }}" class="btn">
            مراجعة الطلب الآن
        </a>
    </div>

    <div class="info-card">
        <p style="color: #6b7280; font-size: 14px; margin: 0;">
            <strong>ملاحظة:</strong> يرجى مراجعة الطلب والرد عليه في أقرب وقت ممكن لضمان تجربة مستخدم ممتازة.
        </p>
    </div>
@endsection

