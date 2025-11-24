@extends('emails.layout')

@section('title', 'طلب حجز جديد')

@section('header_title', 'طلب حجز جديد')
@section('header_subtitle', 'تم استلام طلب حجز جديد من طالب')

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

    .sessions-list {
        margin-top: 15px;
    }

    .session-item {
        background-color: white;
        padding: 15px;
        margin-bottom: 10px;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
        border-right: 4px solid #fbbf24;
    }

    .session-item strong {
        color: #f59e0b;
        display: block;
        margin-bottom: 8px;
    }

    .btn {
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white !important;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        margin: 5px;
        font-size: 14px;
    }

    .action-buttons {
        text-align: center;
        margin: 30px 0;
    }

    .highlight {
        color: #f59e0b;
        font-weight: 700;
    }

    .status-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        background-color: #fff3cd;
        color: #856404;
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
    <h3>👤 معلومات الطالب</h3>
    <div class="info-row">
        <span class="info-label">الاسم:</span>
        <span class="info-value">{{ $booking->student_name }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">رقم الهاتف:</span>
        <span class="info-value">{{ $booking->student_phone }}</span>
    </div>
    @if($booking->student_email)
    <div class="info-row">
        <span class="info-label">البريد الإلكتروني:</span>
        <span class="info-value">{{ $booking->student_email }}</span>
    </div>
    @endif
    <div class="info-row">
        <span class="info-label">المدينة:</span>
        <span class="info-value">{{ $booking->city ?? '—' }}</span>
    </div>
    @if($booking->neighborhood)
    <div class="info-row">
        <span class="info-label">الحي:</span>
        <span class="info-value">{{ $booking->neighborhood }}</span>
    </div>
    @endif
</div>

<div class="info-card">
    <h3>📋 معلومات الحجز</h3>
    <div class="info-row">
        <span class="info-label">المعلم:</span>
        <span class="info-value">{{ $teacher->name_ar ?? $teacher->user->name ?? 'N/A' }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">المادة:</span>
        <span class="info-value">{{ $booking->subject ?? '—' }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">عدد الحصص:</span>
        <span class="info-value">{{ is_array($booking->selected_sessions) ? count($booking->selected_sessions) : 1 }}
            حصة</span>
    </div>
    <div class="info-row">
        <span class="info-label">السعر الإجمالي:</span>
        <span class="info-value highlight">{{ number_format($booking->total_price ?? $booking->price ?? 0, 2) }} {{
            $booking->currency ?? 'ريال' }}</span>
    </div>
    <div class="info-row">
        <span class="info-label">الحالة:</span>
        <span class="info-value">
            <span class="status-badge">قيد الانتظار</span>
        </span>
    </div>
</div>

@if(is_array($booking->selected_sessions) && count($booking->selected_sessions) > 0)
<div class="info-card">
    <h3>📅 تفاصيل الحصص المطلوبة</h3>
    <div class="sessions-list">
        @foreach($booking->selected_sessions as $index => $session)
        <div class="session-item">
            <strong>الحصة {{ $index + 1 }}</strong>
            <div style="color: #6b7280; font-size: 14px;">
                📅 التاريخ: {{ isset($session['date']) ? \Carbon\Carbon::parse($session['date'])->format('Y-m-d') : '—'
                }}<br>
                ⏰ الوقت: {{ $session['time'] ?? '—' }}
            </div>
        </div>
        @endforeach
    </div>
</div>
@endif

@if($booking->notes)
<div class="info-card">
    <h3>📝 ملاحظات إضافية</h3>
    <p
        style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-right: 4px solid #ffc107; color: #856404; line-height: 1.8;">
        {{ $booking->notes }}
    </p>
</div>
@endif

<div class="action-buttons">
    <a href="{{ config('app.url') }}/teacher/bookings" class="btn">عرض الطلبات</a>
    <a href="{{ config('app.url') }}/teacher/dashboard" class="btn">لوحة التحكم</a>
</div>
@endsection