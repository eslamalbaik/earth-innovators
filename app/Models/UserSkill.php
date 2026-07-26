<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class UserSkill extends Model
{
    protected $fillable = [
        'user_id',
        'achievement_id',
        'name',
        'category',
        'source',
        'proficiency_level',
    ];

    public const PROFICIENCY_LEVELS = [
        'beginner'     => 25,
        'intermediate' => 50,
        'advanced'     => 75,
        'expert'       => 100,
    ];

    public const PROFICIENCY_LABELS = [
        'beginner'     => 'مبتدئ',
        'intermediate' => 'متوسط',
        'advanced'     => 'متقدم',
        'expert'       => 'خبير',
    ];

    // ─── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeManual(Builder $query): Builder
    {
        return $query->where('source', 'manual');
    }

    public function scopeAiExtracted(Builder $query): Builder
    {
        return $query->where('source', 'ai_extracted');
    }

    public function scopeByCategory(Builder $query, string $category): Builder
    {
        return $query->where('category', $category);
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function getProficiencyNumericValue(): int
    {
        return self::PROFICIENCY_LEVELS[$this->proficiency_level] ?? 25;
    }

    public function getProficiencyLabelAttribute(): string
    {
        return self::PROFICIENCY_LABELS[$this->proficiency_level] ?? $this->proficiency_level;
    }
}
