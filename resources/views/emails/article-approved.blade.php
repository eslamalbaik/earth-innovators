@extends('emails.layout')

@section('title', 'تمت الموافقة على نشر مقالك')

@section('header_title', '✍️ تمت الموافقة على نشر مقالك')
@section('header_subtitle', 'تهانينا! تمت الموافقة على نشر مقالك')

@push('styles')
<style>
    .info-card {
        background-color: #f8f9fa;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
        border-right: 4px solid #8b5cf6;
    }
    .article-details {
        background-color: #ffffff;
        border: 2px solid #8b5cf6;
        border-radius: 10px;
        padding: 25px;
        margin: 20px 0;
    }
    .button-container {
        text-align: center;
        margin: 30px 0;
    }
    .view-button {
        display: inline-block;
        background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        color: white;
        font-size: 18px;
        font-weight: 600;
        padding: 18px 40px;
        border-radius: 10px;
        text-decoration: none;
        box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);
    }
</style>
@endpush

@section('content')
    <div class="info-card">
        <p style="font-size: 18px; margin-bottom: 15px;">مرحباً {{ $publication->author->name ?? 'عزيزي المعلم' }}! 👋</p>
        <p>تهانينا! تمت الموافقة على نشر مقالك في منصة إرث المبتكرين.</p>
    </div>

    <div class="article-details">
        <h3 style="color: #8b5cf6; margin-bottom: 15px;">تفاصيل المقال:</h3>
        <p><strong>العنوان:</strong> {{ $publication->title }}</p>
        @if($publication->description)
        <div style="margin-top: 15px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <p><strong>الوصف:</strong></p>
            <p>{{ \Illuminate\Support\Str::limit($publication->description, 200) }}</p>
        </div>
        @endif
        @if($publication->approved_at)
        <p style="margin-top: 15px;"><strong>تاريخ الموافقة:</strong> {{ $publication->approved_at->format('Y-m-d H:i') }}</p>
        @endif
    </div>

    <div class="button-container">
        <a href="{{ route('publications.show', $publication->id) ?? '#' }}" class="view-button">عرض المقال</a>
    </div>

    <div class="info-card">
        <p style="font-size: 14px; color: #6b7280;">
            شكراً لمشاركتك! مقالك الآن مرئي لجميع الطلاب والمعلمين في المنصة.
        </p>
    </div>
@endsection

