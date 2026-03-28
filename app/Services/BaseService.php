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

    /**
     * كاش مرتبط بتاق. مع Redis/Memcached يُستخدم tagging الحقيقي.
     * مع file/database/array يُضاف إصدار لكل تاق؛ عند forgetCacheTags يزداد الإصدار فتُهمل المفاتيح القديمة فوراً.
     */
    protected function cacheTags(string $tag, string $key, callable $callback, int $ttl = 3600)
    {
        $cacheDriver = config('cache.default');
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached'], true);

        if ($supportsTags) {
            return Cache::tags([$tag])->remember($key, $ttl, $callback);
        }

        $storageKey = $this->taggedStorageKey($tag, $key);

        return Cache::remember($storageKey, $ttl, $callback);
    }

    protected function tagRevisionCacheKey(string $tag): string
    {
        return '__cache_tag_rev__.'.$tag;
    }

    protected function taggedStorageKey(string $tag, string $key): string
    {
        $revision = (int) Cache::get($this->tagRevisionCacheKey($tag), 0);

        return 'tagged.'.$tag.'.r'.$revision.'.'.$key;
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
        $supportsTags = in_array($cacheDriver, ['redis', 'memcached'], true);

        if ($supportsTags) {
            Cache::tags(array_values(array_unique($tags)))->flush();

            return;
        }

        foreach (array_values(array_unique($tags)) as $tag) {
            $revKey = $this->tagRevisionCacheKey($tag);
            $next = ((int) Cache::get($revKey, 0)) + 1;
            Cache::forever($revKey, $next);
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

