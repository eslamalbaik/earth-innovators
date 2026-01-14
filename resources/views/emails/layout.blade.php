<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', config('app.name', 'إرث المبتكرين'))</title>
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
            background: linear-gradient(135deg, #22c55e 0%, #3b82f6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        .header .logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
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
            color: #22c55e;
            text-decoration: none;
        }
        @media only screen and (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .header {
                padding: 30px 20px;
            }
        }
    </style>
    @stack('styles')
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <img src="{{ url('images/logo-modified.png') }}" alt="{{ config('app.name', 'إرث المبتكرين') }}" />
            </div>
            <h1>@yield('header_title', config('app.name', 'إرث المبتكرين'))</h1>
            <p>@yield('header_subtitle', 'منصة تعليمية لإبداع الطلاب والموهوبين')</p>
        </div>

        <div class="content">
            @yield('content')
        </div>

        <div class="footer">
            <p><strong style="color: #22c55e;">{{ config('app.name', 'إرث المبتكرين') }}</strong></p>
            <p>منصة تعليمية لبناء مجتمع من المبتكرين والموهوبين في المؤسسات تعليمية</p>
            <p>© {{ date('Y') }} جميع الحقوق محفوظة</p>
            <p style="margin-top: 15px;">
                <a href="{{ config('app.url') }}">زيارة الموقع</a> |
                <a href="{{ config('app.url') }}/contact">تواصل معنا</a>
            </p>
        </div>
    </div>
</body>
</html>

