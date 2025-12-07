<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeEvaluation extends Model
{
    protected $fillable = [
        'submission_id',
        'evaluator_id',
        'role',
        'score',
        'feedback',
        'visibility',
        'evaluated_at',
    ];

    protected $casts = [
        'score' => 'decimal:2',
        'evaluated_at' => 'datetime',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(ChallengeSubmission::class, 'submission_id');
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'evaluator_id');
    }

    /**
     * Check if evaluation is visible to student
     */
    public function isVisibleToStudent(): bool
    {
        return $this->visibility === 'student-visible';
    }

    /**
     * Check if evaluation is visible to teachers
     */
    public function isVisibleToTeachers(): bool
    {
        return in_array($this->visibility, ['student-visible', 'teacher-only']);
    }
}
