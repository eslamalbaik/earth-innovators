<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoreRewardRequest extends Model
{
    protected $fillable = [
        'user_id',
        'store_reward_id',
        'status',
        'points_cost',
        'processed_at',
        'processed_by_user_id',
        'admin_note',
    ];

    protected function casts(): array
    {
        return [
            'processed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function storeReward(): BelongsTo
    {
        return $this->belongsTo(StoreReward::class);
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by_user_id');
    }
}
