<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class Achievement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'category',
        'date',
        'external_links',
        'ai_validation_status',
        'ai_confidence_score',
        'ai_analysis_result',
        'evidence_score',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'external_links' => 'array',
            'ai_analysis_result' => 'array',
            'ai_confidence_score' => 'decimal:2',
            'evidence_score' => 'decimal:2',
        ];
    }

    // ─── Types ───────────────────────────────────────────────

    public const TYPES = [
        'project', 'research', 'certificate', 'skill',
        'award', 'patent', 'article', 'product',
    ];

    public const TYPE_LABELS = [
        'project'     => 'مشروع',
        'research'    => 'بحث',
        'certificate' => 'شهادة',
        'skill'       => 'مهارة',
        'award'       => 'جائزة',
        'patent'      => 'براءة اختراع',
        'article'     => 'مقال',
        'product'     => 'منتج',
    ];

    // ─── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(AchievementAttachment::class);
    }

    public function skills(): HasMany
    {
        return $this->hasMany(UserSkill::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeByType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    public function scopeValidated(Builder $query): Builder
    {
        return $query->where('ai_validation_status', 'validated');
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('ai_validation_status', 'pending');
    }

    public function scopeFlagged(Builder $query): Builder
    {
        return $query->where('ai_validation_status', 'flagged');
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function getTypeLabelAttribute(): string
    {
        return self::TYPE_LABELS[$this->type] ?? $this->type;
    }

    public function isValidated(): bool
    {
        return $this->ai_validation_status === 'validated';
    }

    public function isPending(): bool
    {
        return $this->ai_validation_status === 'pending';
    }

    public function isFlagged(): bool
    {
        return $this->ai_validation_status === 'flagged';
    }

    /**
     * Calculate average evidence score from attachments
     */
    public function calculateEvidenceScore(): float
    {
        $attachments = $this->attachments()
            ->whereNotNull('ai_confidence_score')
            ->get();

        if ($attachments->isEmpty()) {
            return 0;
        }

        return round($attachments->avg('ai_confidence_score'), 2);
    }
}
