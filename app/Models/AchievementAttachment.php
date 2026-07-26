<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AchievementAttachment extends Model
{
    protected $fillable = [
        'achievement_id',
        'file_path',
        'file_type',
        'original_name',
        'mime_type',
        'size_bytes',
        'url',
        'ai_evidence_type',
        'ai_confidence_score',
    ];

    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'ai_confidence_score' => 'decimal:2',
        ];
    }

    public const FILE_TYPES = ['pdf', 'image', 'docx', 'video', 'url'];

    public const EVIDENCE_TYPES = [
        'official_certificate' => 95,
        'official_website'     => 90,
        'document'             => 80,
        'video'                => 75,
        'image'                => 70,
        'manual_entry'         => 40,
    ];

    // ─── Relationships ───────────────────────────────────────

    public function achievement(): BelongsTo
    {
        return $this->belongsTo(Achievement::class);
    }

    // ─── Helpers ─────────────────────────────────────────────

    public function isUrl(): bool
    {
        return $this->file_type === 'url';
    }

    public function getDefaultConfidenceScore(): int
    {
        return self::EVIDENCE_TYPES[$this->ai_evidence_type] ?? 40;
    }
}
