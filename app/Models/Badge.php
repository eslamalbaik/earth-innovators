<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Badge extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'name_ar',
        'description',
        'description_ar',
        'icon',
        'image',
        'type',
        'badge_category',
        'level',
        'points_required',
        'is_active',
        'status',
        'created_by',
        'approved_by',
        'school_id',
        'approved_at',
        'rejection_reason',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('awarded_by', 'project_id', 'challenge_id', 'reason', 'earned_at')
            ->withTimestamps();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function communityBadgeProgress(): HasMany
    {
        return $this->hasMany(UserCommunityBadge::class, 'badge_id');
    }

    public function isAchievementBadge(): bool
    {
        return $this->badge_category === 'achievement';
    }

    public function isCommunityBadge(): bool
    {
        return $this->badge_category === 'community';
    }

    /**
     * Get level label
     */
    public function getLevelLabelAttribute(): ?string
    {
        return match($this->level) {
            'bronze' => 'Bronze',
            'silver' => 'Silver',
            'gold' => 'Gold',
            default => null,
        };
    }

    /**
     * Get level label in Arabic
     */
    public function getLevelLabelArAttribute(): ?string
    {
        return match($this->level) {
            'bronze' => 'برونزي',
            'silver' => 'فضي',
            'gold' => 'ذهبي',
            default => null,
        };
    }

    /**
     * Check if badge is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if badge is global (community badge without school)
     */
    public function isGlobal(): bool
    {
        return $this->isCommunityBadge() && !$this->school_id;
    }
}
