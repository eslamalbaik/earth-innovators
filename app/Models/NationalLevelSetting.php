<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class NationalLevelSetting extends Model
{
    protected $fillable = [
        'code', 'label_ar', 'label_en', 'min_score', 'max_score', 'color', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'min_score'  => 'integer',
            'max_score'  => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public const CACHE_KEY = 'national_level_settings';

    /**
     * Ordered list of levels, cached until the admin edits thresholds.
     */
    public static function ordered(): \Illuminate\Support\Collection
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return self::orderBy('sort_order')->get();
        });
    }

    public static function forScore(float $score): ?self
    {
        return self::ordered()->first(
            fn (self $level) => $score >= $level->min_score && $score <= $level->max_score
        );
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
