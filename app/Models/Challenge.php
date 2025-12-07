<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challenge extends Model
{
    protected $fillable = [
        'created_by',
        'school_id',
        'title',
        'objective',
        'description',
        'instructions',
        'challenge_type',
        'category',
        'age_group',
        'start_date',
        'deadline',
        'status',
        'points_reward',
        'badges_reward',
        'max_participants',
        'current_participants',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'deadline' => 'datetime',
        'badges_reward' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the owner teacher (creator of the challenge)
     */
    public function ownerTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get owner teacher ID (alias for created_by)
     */
    public function getOwnerTeacherIdAttribute(): ?int
    {
        return $this->created_by;
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_challenges')
            ->withPivot('status', 'rank', 'points_earned', 'submitted_at', 'evaluated_at')
            ->withTimestamps();
    }

    public function projectChallenges(): HasMany
    {
        return $this->hasMany(ProjectChallenge::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ChallengeSubmission::class);
    }

    /**
     * Get challenge type label in Arabic
     */
    public function getChallengeTypeLabelAttribute(): string
    {
        return match($this->challenge_type) {
            '60_seconds' => 'تحدّي 60 ثانية',
            'mental_math' => 'حلها بدون قلم',
            'conversions' => 'تحدّي التحويلات',
            'team_fastest' => 'تحدّي الفريق الأسرع',
            'build_problem' => 'ابنِ مسألة',
            'custom' => 'تحدّي مخصص',
            default => 'تحدّي',
        };
    }

    /**
     * Check if challenge is active (between start and deadline)
     */
    public function isActive(): bool
    {
        $now = now();
        return $this->status === 'active' 
            && $this->start_date <= $now 
            && $this->deadline >= $now;
    }

    /**
     * Check if challenge is upcoming
     */
    public function isUpcoming(): bool
    {
        return $this->status === 'active' && $this->start_date > now();
    }

    /**
     * Check if challenge is finished
     */
    public function isFinished(): bool
    {
        return $this->status === 'completed' || $this->deadline < now();
    }
}
