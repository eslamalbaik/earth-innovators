<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class ReferenceStandard extends Model
{
    protected $fillable = [
        'scope', 'domain_ar', 'domain_en', 'standard_name', 'usage_ar', 'usage_en',
        'index_key', 'is_active', 'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public const CACHE_KEY = 'reference_standards_by_index_key';

    /**
     * Active standards grouped by the InnovationIndex key they map to
     * (e.g. 'skills', 'innovation', 'ip'), for "compliant with standard X"
     * tags on evaluation reports/certificates.
     */
    public static function forIndexKey(string $indexKey): \Illuminate\Support\Collection
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return self::where('is_active', true)->orderBy('sort_order')->get();
        })->where('index_key', $indexKey)->values();
    }

    public static function flushCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
