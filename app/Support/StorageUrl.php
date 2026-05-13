<?php

namespace App\Support;

class StorageUrl
{
    public static function url(?string $path, mixed $version = null): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        $path = trim($path);

        if (str_starts_with($path, 'data:') || str_starts_with($path, 'blob:')) {
            return $path;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            $parsed = parse_url($path);
            $absolutePath = $parsed['path'] ?? '';

            if (!str_starts_with($absolutePath, '/storage/') && !str_starts_with($absolutePath, '/media/')) {
                return $path;
            }

            $path = $absolutePath . (isset($parsed['query']) ? '?' . $parsed['query'] : '');
        }

        $query = '';
        if (str_contains($path, '?')) {
            [$path, $query] = explode('?', $path, 2);
            $query = $query !== '' ? '?' . $query : '';
        }

        if (str_starts_with($path, '/images/') || str_starts_with($path, 'images/')) {
            return url('/' . ltrim($path, '/')) . $query;
        }

        $normalized = ltrim($path, '/');
        $normalized = preg_replace('#^(storage|media)/#', '', $normalized);

        if ($normalized === '') {
            return null;
        }

        if ($version !== null && $version !== '') {
            $query .= ($query === '' ? '?' : '&') . 'v=' . urlencode((string) $version);
        }

        return url('/media/' . $normalized) . $query;
    }

    public static function diskPath(?string $path): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        $path = trim($path);

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            $parsed = parse_url($path);
            $path = $parsed['path'] ?? '';
        }

        $path = ltrim($path, '/');
        $path = preg_replace('#^(storage|media)/#', '', $path);

        return $path !== '' ? $path : null;
    }
}
