<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectSubmission extends Model
{
    use HasFactory;
    protected $fillable = [
        'project_id',
        'student_id',
        'files',
        'comment',
        'status',
        'feedback',
        'reviewed_by',
        'rating',
        'badges',
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

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
