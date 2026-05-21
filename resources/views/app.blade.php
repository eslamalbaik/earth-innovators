<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'إرث المبتكرين - Innovators Legacy') }}</title>

    @php
        $canonicalBase = rtrim(config('site.primary_url', config('app.url')), '/');
        $canonicalUrl = $canonicalBase . request()->getPathInfo();
    @endphp
    <link rel="canonical" href="{{ $canonicalUrl }}" />

    <!-- Fonts - Cairo from Google Fonts CDN -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900&display=swap"
        rel="stylesheet">
    <link rel="icon" type="image/png" href="/images/logo-modified.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/logo-modified.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/images/logo-modified.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/images/logo-modified.png">
    <!-- Scripts -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>