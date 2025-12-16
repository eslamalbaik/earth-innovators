<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeParticipation extends Model
{
    protected $table = 'challenge_participants';

    protected $fillable = [
        'challenge_id',
        'user_id',
        'status',
        'points_earned',
        'rank',
        'joined_at',
        'completed_at',
    ];

    protected $casts = [
        'joined_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if participation is active
     */
    public function isActive(): bool
    {
        return in_array($this->status, ['joined', 'in_progress']);
    }

    /**
     * Check if participation is completed
     */
    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
