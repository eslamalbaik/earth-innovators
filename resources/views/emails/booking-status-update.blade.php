@extends('emails.layout')

@section('title', 'تحديث حالة الطلب')

@section('header_title', 'تحديث حالة الطلب')
@section('header_subtitle', 'تم تحديث حالة طلبك')

@push('styles')
<style>
    .status-badge {
        display: inline-block;
        padding: 12px 24px;
        border-radius: 20px;
        font-weight: bold;
        margin: 15px 0;
        font-size: 18px;
    }
    .status-pending {
        background-color: #fff3cd;
        color: #856404;
    }
    .status-confirmed, .status-approved {
        background-color: #d4edda;
        color: #155724;
    }
    .status-cancelled {
        background-color: #f8d7da;
        color: #721c24;
    }
    .status-completed {
        background-color: #d1ecf1;
        color: #0c5460;
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
    <div style="text-align: center; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-bottom: 15px;">الحالة الجديدة:</h3>
        <span class="status-badge status-{{ $booking->status }}">
            @switch($booking->status)
                @case('pending')
                    قيد الانتظار
                    @break
                @case('confirmed')
                @case('approved')
                    مؤكد
                    @break
                @case('cancelled')
                    ملغي
                    @break
                @case('completed')
                    مكتمل
                    @break
                @default
                    {{ $booking->status }}
            @endswitch
        </span>
    </div>

    <div class="info-card">
        <h3>📋 معلومات الطلب</h3>
        <div class="info-row">
            <span class="info-label">رقم الطلب:</span>
            <span class="info-value highlight">#{{ $booking->id }}</span>
        </div>
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
            <span class="info-value">{{ is_array($booking->selected_sessions) ? count($booking->selected_sessions) : 1 }} حصة</span>
        </div>
        <div class="info-row">
            <span class="info-label">السعر الإجمالي:</span>
            <span class="info-value highlight">{{ number_format($booking->total_price ?? $booking->price ?? 0, 2) }} {{ $booking->currency ?? 'ريال' }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">تاريخ الطلب:</span>
            <span class="info-value">{{ $booking->created_at->format('Y-m-d H:i:s') }}</span>
        </div>
    </div>

    @if(is_array($booking->selected_sessions) && count($booking->selected_sessions) > 0)
    <div class="info-card">
        <h3>📅 تفاصيل الحصص</h3>
        <div class="sessions-list">
            @foreach($booking->selected_sessions as $index => $session)
            <div class="session-item">
                <strong>الحصة {{ $index + 1 }}</strong>
                <div style="color: #6b7280; font-size: 14px;">
                    📅 التاريخ: {{ isset($session['date']) ? \Carbon\Carbon::parse($session['date'])->format('Y-m-d') : '—' }}<br>
                    ⏰ الوقت: {{ $session['time'] ?? '—' }}
                </div>
            </div>
            @endforeach
        </div>
    </div>
    @endif

    @if($booking->notes || $booking->teacher_notes)
    <div class="info-card">
        <h3>📝 ملاحظات</h3>
        @if($booking->teacher_notes)
        <p style="background-color: #fff3cd; padding: 15px; border-radius: 5px; border-right: 4px solid #ffc107; color: #856404; line-height: 1.8;">
            <strong>من المعلم:</strong> {{ $booking->teacher_notes }}
        </p>
        @endif
        @if($booking->notes)
        <p style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; border-right: 4px solid #2196f3; color: #0c5460; line-height: 1.8; margin-top: 10px;">
            <strong>ملاحظاتك:</strong> {{ $booking->notes }}
        </p>
        @endif
    </div>
    @endif

    <div class="action-buttons">
        <a href="{{ config('app.url') }}/bookings" class="btn">عرض طلباتي</a>
        @if($teacher->id)
        <a href="{{ config('app.url') }}/teachers/{{ $teacher->id }}" class="btn">عرض المعلم</a>
        @endif
    </div>
@endsection
