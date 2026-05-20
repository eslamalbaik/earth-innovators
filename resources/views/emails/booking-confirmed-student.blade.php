<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تم تأكيد حجزك</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Cairo', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header .logo {
            margin: 0 auto 20px;
        }
        .header .logo img {
            max-width: 280px;
            height: auto;
            display: block;
            margin: 0 auto;
        }
        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 700;
        }
        .header p {
            font-size: 16px;
            opacity: 0.95;
        }
        .content {
            padding: 40px 30px;
        }
        .success-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
            font-size: 18px;
            font-weight: 600;
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
        .whatsapp-button {
            display: inline-block;
            background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 10px 5px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(37, 211, 102, 0.3);
            transition: transform 0.2s;
        }
        .whatsapp-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(37, 211, 102, 0.4);
        }
        .whatsapp-button::before {
            content: "💬 ";
            margin-left: 8px;
        }
        .action-buttons {
            text-align: center;
            margin: 30px 0;
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
        .footer {
            background-color: #1f2937;
            color: #9ca3af;
            padding: 30px;
            text-align: center;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #fbbf24;
            text-decoration: none;
        }
        .highlight {
            color: #f59e0b;
            font-weight: 700;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .header {
                padding: 30px 20px;
            }
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
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <img src="{{ url('images/logo-modified.png') }}" alt="{{ config('app.name', 'إرث المبتكرين') }}" />
            </div>
            <h1>تم تأكيد حجزك بنجاح!</h1>
            <p>نحن سعداء بإتمام عملية الحجز</p>
        </div>

        <div class="content">
            <div class="success-badge">
                ✅ تم تأكيد الحجز من قبل المعلم
            </div>

            <div class="info-card">
                <h3>👨‍🏫 معلومات المعلم</h3>
                <div class="info-row">
                    <span class="info-label">الاسم:</span>
                    <span class="info-value">{{ $teacher->name_ar ?? $teacher->user->name ?? 'N/A' }}</span>
                </div>
                @if($teacher->user->phone)
                <div class="info-row">
                    <span class="info-label">رقم الواتساب:</span>
                    <span class="info-value">
                        <a href="https://wa.me/{{ str_replace('+', '', $teacher->user->phone) }}" 
                           class="whatsapp-button" 
                           style="padding: 8px 15px; font-size: 13px; margin: 0;">
                            {{ $teacher->user->phone }}
                        </a>
                    </span>
                </div>
                @endif
                @if($teacher->user->email)
                <div class="info-row">
                    <span class="info-label">البريد الإلكتروني:</span>
                    <span class="info-value">{{ $teacher->user->email }}</span>
                </div>
                @endif
                @if($teacher->city)
                <div class="info-row">
                    <span class="info-label">المدينة:</span>
                    <span class="info-value">{{ $teacher->city }}</span>
                </div>
                @endif
            </div>

            <div class="info-card">
                <h3>📋 تفاصيل الحجز</h3>
                <div class="info-row">
                    <span class="info-label">رقم الحجز:</span>
                    <span class="info-value highlight">#{{ $booking->id }}</span>
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
                    <span class="info-label">المبلغ الإجمالي:</span>
                    <span class="info-value highlight">{{ number_format($booking->total_price ?? $booking->price ?? 0, 2) }} {{ $booking->currency ?? 'ريال' }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">حالة الدفع:</span>
                    <span class="info-value" style="color: #10b981; font-weight: 600;">✅ تم الدفع</span>
                </div>
                <div class="info-row">
                    <span class="info-label">حالة الحجز:</span>
                    <span class="info-value" style="color: #10b981; font-weight: 600;">✅ مؤكد</span>
                </div>
            </div>

            @if(is_array($booking->selected_sessions) && count($booking->selected_sessions) > 0)
            <div class="info-card">
                <h3>📅 مواعيد الحصص</h3>
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

            @if($booking->teacher_notes)
            <div class="info-card">
                <h3>📝 ملاحظات من المعلم</h3>
                <p style="color: #1f2937; line-height: 1.8; padding: 10px 0;">{{ $booking->teacher_notes }}</p>
            </div>
            @endif

            <div class="action-buttons">
                @if($teacher->user->phone)
                <a href="https://wa.me/{{ str_replace('+', '', $teacher->user->phone) }}?text=مرحباً، أنا {{ $booking->student_name ?? 'الطالب' }}، لدي حجز رقم #{{ $booking->id }}" 
                   class="whatsapp-button" 
                   target="_blank">
                    التواصل مع المعلم عبر الواتساب
                </a>
                @endif
                <br>
                <a href="{{ config('app.url') }}/bookings" class="btn">عرض جميع الحجوزات</a>
            </div>
        </div>

        <div class="footer">
            <p><strong style="color: #fbbf24;">{{ config('app.name', 'معلمك') }}</strong></p>
            <p>منصة تعليمية متخصصة في ربط الطلاب بالمعلمين</p>
            <p>© {{ date('Y') }} جميع الحقوق محفوظة</p>
            <p style="margin-top: 15px;">
                <a href="{{ config('app.url') }}">زيارة الموقع</a> | 
                <a href="{{ config('app.url') }}/contact">تواصل معنا</a>
            </p>
        </div>
    </div>
</body>
</html>

