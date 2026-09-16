<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A discount/trip/event a school offers its own users, or a global one the
 * admin offers everyone. Requirement 7.3 — the two pools must always be
 * clearly distinguishable in the UI, never merged silently.
 */
class Initiative extends Model
{
    protected $fillable = [
        'school_id', 'title_ar', 'title_en', 'description_ar', 'description_en',
        'image', 'audience', 'start_date', 'end_date', 'benefit_details',
        'is_active', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date'   => 'date',
            'is_active'  => 'boolean',
        ];
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(User::class, 'school_id');
    }

    public function scopeGlobal(Builder $query): Builder
    {
        return $query->whereNull('school_id');
    }

    public function scopeForSchool(Builder $query, int $schoolId): Builder
    {
        return $query->where('school_id', $schoolId);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', now()->toDateString()));
    }

    public function scopeForAudience(Builder $query, string $role): Builder
    {
        $audience = $role === 'teacher' ? 'teachers' : 'students';

        return $query->whereIn('audience', [$audience, 'both']);
    }
}
