<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Challenge extends Model
{
    use HasFactory;
    protected $fillable = [
        'created_by',
        'school_id',
        'title',
        'objective',
        'description',
        'image',
        'instructions',
        'challenge_type',
        'category',
        'age_group',
        'difficulty',
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

    protected $appends = [
        'image_url',
    ];

    /**
     * Get the image URL attribute
     */
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        // If it's already a full URL, return as is
        if (str_starts_with($this->image, 'http://') || str_starts_with($this->image, 'https://')) {
            return $this->image;
        }

        // If it starts with /storage/, return as is
        if (str_starts_with($this->image, '/storage/')) {
            return $this->image;
        }

        // Otherwise, prepend /storage/
        return '/storage/' . $this->image;
    }

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
        // School is a User with role 'school'
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
     * Get all participants in this challenge
     */
    public function participants(): HasMany
    {
        return $this->hasMany(ChallengeParticipation::class);
    }

    /**
     * Get active participants
     */
    public function activeParticipants(): HasMany
    {
        return $this->hasMany(ChallengeParticipation::class)
            ->whereIn('status', ['joined', 'in_progress']);
    }

    /**
     * Get completed participants
     */
    public function completedParticipants(): HasMany
    {
        return $this->hasMany(ChallengeParticipation::class)
            ->where('status', 'completed');
    }

    /**
     * Get participants as users (many-to-many through participation)
     */
    public function participantUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'challenge_participants')
            ->withPivot('status', 'points_earned', 'rank', 'joined_at', 'completed_at')
            ->withTimestamps();
    }

    /**
     * Check if a user is participating in this challenge
     */
    public function hasParticipant(int $userId): bool
    {
        return $this->participants()->where('user_id', $userId)->exists();
    }

    /**
     * Get remaining time in days
     */
    public function getRemainingDaysAttribute(): ?int
    {
        if ($this->deadline < now()) {
            return 0;
        }
        return now()->diffInDays($this->deadline, false);
    }

    /**
     * Get progress percentage (0-100)
     */
    public function getProgressPercentageAttribute(): float
    {
        if (!$this->max_participants) {
            return 0;
        }
        return min(100, ($this->current_participants / $this->max_participants) * 100);
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
