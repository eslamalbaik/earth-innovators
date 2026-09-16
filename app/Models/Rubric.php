<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A named, reusable project-evaluation rubric built by a teacher: a set of
 * weighted criteria, each with its own performance-level matrix. Saved at
 * either the teacher level (scope=teacher, applies broadly) or the class
 * level (scope=class, scoped to a grade+subject combination), and selectable
 * when creating any new project — see App\Services\AIEngine\RubricEvaluationService
 * for how it drives the AI evaluation engine once attached to a project.
 */
class Rubric extends Model
{
    protected $fillable = [
        'teacher_id',
        'school_id',
        'name',
        'name_ar',
        'description',
        'description_ar',
        'scope',
        'grade',
        'subject',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function criteria(): HasMany
    {
        return $this->hasMany(RubricCriterion::class)->orderBy('order');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeForTeacher(Builder $query, int $teacherId): Builder
    {
        return $query->where('teacher_id', $teacherId);
    }

    /**
     * Sum of criteria weights (should be ~100 for a well-formed rubric).
     */
    public function totalWeight(): float
    {
        return (float) $this->criteria->sum('weight');
    }
}
