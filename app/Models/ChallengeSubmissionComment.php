<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChallengeSubmissionComment extends Model
{
    protected $fillable = [
        'submission_id',
        'user_id',
        'comment',
        'mentioned_user_ids',
        'parent_id',
    ];

    protected $casts = [
        'mentioned_user_ids' => 'array',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(ChallengeSubmission::class, 'submission_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(ChallengeSubmissionComment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(ChallengeSubmissionComment::class, 'parent_id');
    }

    /**
     * Get mentioned users
     */
    public function mentionedUsers()
    {
        if (!$this->mentioned_user_ids || empty($this->mentioned_user_ids)) {
            return collect();
        }

        return User::whereIn('id', $this->mentioned_user_ids)->get();
    }
}
