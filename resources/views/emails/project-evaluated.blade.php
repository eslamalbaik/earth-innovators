@extends('emails.layout')

@section('title', 'تم تقييم مشروعك')

@section('header_title', '📊 تم تقييم مشروعك')
@section('header_subtitle', 'تم مراجعة وتقييم مشروعك')

@push('styles')
<style>
    .info-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        border-right: 4px solid #3b82f6;
    }
    .project-details {
        background-color: #ffffff;
        border: 2px solid #3b82f6;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
    }
    .rating-badge {
        display: inline-block;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: white;
        font-size: 24px;
        font-weight: 700;
        padding: 15px 30px;
        border-radius: 10px;
        margin: 15px 0;
    }
</style>
@endpush

@section('content')
    <div class="info-card">
        <p style="font-size: 18px; margin-bottom: 15px;">مرحباً {{ $submission->student->name ?? 'عزيزي الطالب' }}! 👋</p>
        <p>تم مراجعة وتقييم مشروعك بنجاح.</p>
    </div>

    <div class="project-details">
        <h3 style="color: #3b82f6; margin-bottom: 15px;">تفاصيل التقييم:</h3>
        <p><strong>اسم المشروع:</strong> {{ $submission->project->title ?? 'غير محدد' }}</p>
        
        @if($submission->rating)
        <div style="text-align: center; margin: 20px 0;">
            <p style="margin-bottom: 10px;"><strong>التقييم:</strong></p>
            <div class="rating-badge">{{ $submission->rating }}/5</div>
        </div>
        @endif

        @if($submission->status)
        <p><strong>الحالة:</strong> 
            @if($submission->status === 'approved')
                <span style="color: #22c55e; font-weight: 600;">✓ مقبول</span>
            @elseif($submission->status === 'rejected')
                <span style="color: #ef4444; font-weight: 600;">✗ مرفوض</span>
            @else
                {{ $submission->status }}
            @endif
        </p>
        @endif

        @if($submission->feedback)
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <p><strong>التعليقات:</strong></p>
            <p>{{ $submission->feedback }}</p>
        </div>
        @endif
    </div>

    <div class="info-card">
        <p style="font-size: 14px; color: #6b7280;">
            يمكنك مراجعة تفاصيل التقييم والشارات التي حصلت عليها من خلال حسابك في المنصة.
        </p>
    </div>
@endsection

