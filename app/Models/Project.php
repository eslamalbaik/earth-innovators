<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'teacher_id',
        'school_id',
        'approved_by',
        'approved_at',
        'title',
        'description',
        'category',
        'status',
        'files',
        'images',
        'report',
        'views',
        'likes',
        'rating',
        'points_earned',
        'self_evaluation',
    ];

    protected $casts = [
        'files' => 'array',
        'images' => 'array',
        'self_evaluation' => 'array',
        'rating' => 'decimal:2',
        'approved_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class, 'teacher_id');
    }

    public function challenges(): BelongsToMany
    {
        return $this->belongsToMany(Challenge::class, 'project_challenges')
            ->withPivot('status', 'rank', 'points_earned', 'submitted_at', 'evaluated_at')
            ->withTimestamps();
    }

    public function projectChallenges(): HasMany
    {
        return $this->hasMany(ProjectChallenge::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ProjectSubmission::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ProjectComment::class)->whereNull('parent_id');
    }

    public function allComments(): HasMany
    {
        return $this->hasMany(ProjectComment::class);
    }

    public function acceptanceCriteria(): HasMany
    {
        return $this->hasMany(AcceptanceCriterion::class)->ordered();
    }
}
