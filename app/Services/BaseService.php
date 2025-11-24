<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

abstract class BaseService
{
    protected function cache(string $key, callable $callback, int $ttl = 3600)
    {
        return Cache::remember($key, $ttl, $callback);
    }

    protected function cacheTags(string $tag, string $key, callable $callback, int $ttl = 3600)
    {
        // Only use tags if the cache driver supports it (Redis, Memcached)
        $cacheDriver = config('cache.default');
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached']);
        
        if ($supportsTags) {
            return Cache::tags([$tag])->remember($key, $ttl, $callback);
        }
        
        // Fallback to regular cache without tags
        return Cache::remember($key, $ttl, $callback);
    }

    protected function forgetCache(string $key): void
    {
        Cache::forget($key);
    }

    protected function forgetCachePattern(string $pattern): void
    {
        // For wildcard cache clearing, we'll use tags only if supported
        $cacheDriver = config('cache.default');
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached']);
        
        if ($supportsTags) {
            // Extract tag from pattern (e.g., "school_students_1_*" -> "school_students_1")
            $tag = preg_replace('/\*$/', '', $pattern);
            Cache::tags([$tag])->flush();
        } else {
            // For non-tagging drivers, we can't easily clear by pattern
            // This is a limitation, but we'll log it
            Log::warning("Cache pattern clearing not supported for driver: {$cacheDriver}");
        }
    }

    protected function forgetCacheTags(array $tags): void
    {
        $cacheDriver = config('cache.default');
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached']);
        
        if ($supportsTags) {
            Cache::tags($tags)->flush();
        } else {
            // For non-tagging drivers, we can't flush by tags
            // Log a warning but don't throw an error
            Log::warning("Cache tags not supported for driver: {$cacheDriver}. Cache tags: " . implode(', ', $tags));
        }
    }

    protected function logError(string $message, array $context = []): void
    {
        Log::error($message, $context);
    }

    protected function logInfo(string $message, array $context = []): void
    {
        Log::info($message, $context);
    }
}

