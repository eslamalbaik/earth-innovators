<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChallengeSuggestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_id',
        'title',
        'description',
        'category',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_notes',
        'approved_challenge_id',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approvedChallenge(): BelongsTo
    {
        return $this->belongsTo(Challenge::class, 'approved_challenge_id');
    }
}
