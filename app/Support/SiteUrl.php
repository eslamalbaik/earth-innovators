<?php

namespace App\Support;

class SiteUrl
{
    public static function primary(string $path = ''): string
    {
        $base = rtrim((string) config('site.primary_url', config('app.url')), '/');

        if ($path === '') {
            return $base;
        }

        return $base.'/'.ltrim($path, '/');
    }

    public static function primaryHost(): string
    {
        return (string) parse_url(self::primary(), PHP_URL_HOST);
    }

    public static function isPrimaryHost(?string $host = null): bool
    {
        $host = strtolower($host ?? (string) request()?->getHost());

        return $host !== '' && $host === strtolower(self::primaryHost());
    }

    public static function isSecondaryHost(?string $host = null): bool
    {
        $host = strtolower($host ?? (string) request()?->getHost());

        return $host !== '' && in_array($host, config('site.secondary_hosts', []), true);
    }
}
