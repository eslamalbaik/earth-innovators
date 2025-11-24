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
        'title',
        'description',
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
}
