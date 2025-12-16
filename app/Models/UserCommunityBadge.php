<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCommunityBadge extends Model
{
    protected $table = 'user_community_badge_progress';

    protected $fillable = [
        'user_id',
        'badge_id',
        'score',
        'last_updated_at',
    ];

    protected $casts = [
        'last_updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class);
    }

    /**
     * Get the percentage score (0-100)
     */
    public function getPercentageAttribute(): int
    {
        return min(100, max(0, (int) $this->score));
    }

    /**
     * Get the current range based on score
     * Returns: 'beginner' (0-20), 'heart' (21-50), 'brain' (51-80), 'rocket' (81-100)
     */
    public function getCurrentRangeAttribute(): string
    {
        $score = $this->score;

        if ($score >= 81) {
            return 'rocket';
        } elseif ($score >= 51) {
            return 'brain';
        } elseif ($score >= 21) {
            return 'heart';
        } else {
            return 'beginner';
        }
    }
}
