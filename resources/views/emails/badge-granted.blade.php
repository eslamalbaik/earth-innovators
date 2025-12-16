@extends('emails.layout')

@section('title', 'حصلت على شارة جديدة')

@section('header_title', '🏅 حصلت على شارة جديدة')
@section('header_subtitle', 'تهانينا! حصلت على شارة جديدة')

@push('styles')
<style>
    .info-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        border-right: 4px solid #f59e0b;
    }
    .badge-card {
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        border-radius: 15px;
        padding: 30px;
        margin: 20px 0;
        text-align: center;
    }
    .badge-card h2 {
        font-size: 28px;
        margin-bottom: 15px;
    }
</style>
@endpush

@section('content')
    <div class="info-card">
        <p style="font-size: 18px; margin-bottom: 15px;">مرحباً {{ $user->name }}! 👋</p>
        <p>تهانينا! لقد حصلت على شارة جديدة في منصة إرث المبتكرين.</p>
    </div>

    <div class="badge-card">
        <h2>{{ $badge->name_ar ?? $badge->name }}</h2>
        @if($badge->description_ar || $badge->description)
        <p style="font-size: 16px; opacity: 0.95; margin-top: 15px;">
            {{ $badge->description_ar ?? $badge->description }}
        </p>
        @endif
    </div>

    <div class="info-card">
        <p style="font-size: 14px; color: #6b7280;">
            استمر في إبداعك! يمكنك رؤية جميع الشارات التي حصلت عليها في ملفك الشخصي.
        </p>
    </div>
@endsection

