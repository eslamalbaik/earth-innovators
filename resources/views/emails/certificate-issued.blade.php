@extends('emails.layout')

@section('title', 'تم إصدار شهادة جديدة')

@section('header_title', '🎓 تم إصدار شهادة جديدة')
@section('header_subtitle', 'تهانينا! تم إصدار شهادة جديدة لك')

@push('styles')
<style>
    .info-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        border-right: 4px solid #22c55e;
    }
    .certificate-details {
        background-color: #ffffff;
        border: 2px solid #22c55e;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
    }
    .certificate-details h3 {
        color: #22c55e;
        margin-bottom: 15px;
    }
    .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #e5e7eb;
    }
    .detail-row:last-child {
        border-bottom: none;
    }
    .button-container {
        text-align: center;
        margin: 30px 0;
    }
    .view-button {
        display: inline-block;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        font-size: 18px;
        font-weight: 600;
        padding: 18px 40px;
        border-radius: 10px;
        text-decoration: none;
        box-shadow: 0 4px 6px rgba(34, 197, 94, 0.3);
    }
</style>
@endpush

@section('content')
    <div class="info-card">
        <p style="font-size: 18px; margin-bottom: 15px;">مرحباً {{ $user->name }}! 👋</p>
        <p>تهانينا! تم إصدار شهادة جديدة لك في منصة إرث المبتكرين.</p>
    </div>

    <div class="certificate-details">
        <h3>تفاصيل الشهادة:</h3>
        <div class="detail-row">
            <span><strong>اسم الشهادة:</strong></span>
            <span>{{ $certificate->title_ar ?? $certificate->title }}</span>
        </div>
        @if($certificate->certificate_number)
        <div class="detail-row">
            <span><strong>رقم الشهادة:</strong></span>
            <span>{{ $certificate->certificate_number }}</span>
        </div>
        @endif
        @if($certificate->issue_date)
        <div class="detail-row">
            <span><strong>تاريخ الإصدار:</strong></span>
            <span>{{ $certificate->issue_date->format('Y-m-d') }}</span>
        </div>
        @endif
        @if($certificate->description_ar)
        <div class="detail-row">
            <span><strong>الوصف:</strong></span>
            <span>{{ $certificate->description_ar }}</span>
        </div>
        @endif
    </div>

    @if($certificate->file_path)
    <div class="button-container">
        <a href="{{ asset('storage/' . $certificate->file_path) }}" class="view-button">عرض الشهادة</a>
    </div>
    @endif

    <div class="info-card">
        <p style="font-size: 14px; color: #6b7280;">
            يمكنك دائماً الوصول إلى جميع شهاداتك من خلال حسابك في المنصة.
        </p>
    </div>
@endsection

