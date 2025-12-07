<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChallengeSubmission extends Model
{
    protected $fillable = [
        'challenge_id',
        'student_id',
        'files',
        'answer',
        'comment',
        'status',
        'feedback',
        'reviewed_by',
        'rating',
        'badges',
        'points_earned',
        'submitted_at',
        'reviewed_at',
    ];

    protected $casts = [
        'files' => 'array',
        'badges' => 'array',
        'rating' => 'decimal:2',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function challenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(ChallengeEvaluation::class, 'submission_id');
    }

    /**
     * Get the latest evaluation for this submission
     */
    public function getLatestEvaluationAttribute()
    {
        return $this->evaluations()->latest('evaluated_at')->first();
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ChallengeSubmissionComment::class, 'submission_id')
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc');
    }

    public function allComments(): HasMany
    {
        return $this->hasMany(ChallengeSubmissionComment::class, 'submission_id')
            ->orderBy('created_at', 'desc');
    }

    /**
     * Get the latest student-visible evaluation
     */
    public function getLatestStudentVisibleEvaluationAttribute()
    {
        return $this->evaluations()
            ->where('visibility', 'student-visible')
            ->latest('evaluated_at')
            ->first();
    }
}
