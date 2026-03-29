<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoreReward extends Model
{
    protected $fillable = [
        'slug',
        'name_en',
        'name_ar',
        'icon',
        'points_cost',
        'is_active',
        'sort_order',
        'requires_manual_approval',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'requires_manual_approval' => 'boolean',
        ];
    }

    public function requests(): HasMany
    {
        return $this->hasMany(StoreRewardRequest::class);
    }
}
