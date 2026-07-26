<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InnovationIndex extends Model
{
    use HasFactory;

    protected $table = 'innovation_indexes';

    protected $fillable = [
        'user_id',
        'skills_index',
        'innovation_index',
        'intelligence_index',
        'creativity_index',
        'projects_index',
        'leadership_index',
        'ip_index',
        'future_readiness_index',
        'overall_score',
        'classification',
        'calculation_metadata',
        'calculated_at',
    ];

    protected function casts(): array
    {
        return [
            'skills_index'           => 'decimal:2',
            'innovation_index'       => 'decimal:2',
            'intelligence_index'     => 'decimal:2',
            'creativity_index'       => 'decimal:2',
            'projects_index'         => 'decimal:2',
            'leadership_index'       => 'decimal:2',
            'ip_index'               => 'decimal:2',
            'future_readiness_index' => 'decimal:2',
            'overall_score'          => 'decimal:2',
            'calculation_metadata'   => 'array',
            'calculated_at'          => 'datetime',
        ];
    }

    public const CLASSIFICATIONS = [
        'diamond'    => ['min' => 95, 'max' => 100, 'label' => 'ماسي',    'color' => '#b9f2ff', 'icon' => '💎'],
        'platinum'   => ['min' => 85, 'max' => 94,  'label' => 'بلاتيني', 'color' => '#e5e4e2', 'icon' => '🏆'],
        'gold'       => ['min' => 70, 'max' => 84,  'label' => 'ذهبي',    'color' => '#ffd700', 'icon' => '🥇'],
        'silver'     => ['min' => 55, 'max' => 69,  'label' => 'فضي',     'color' => '#c0c0c0', 'icon' => '🥈'],
        'bronze'     => ['min' => 40, 'max' => 54,  'label' => 'برونزي',  'color' => '#cd7f32', 'icon' => '🥉'],
        'developing' => ['min' => 0,  'max' => 39,  'label' => 'نامٍ',     'color' => '#90ee90', 'icon' => '🌱'],
    ];

    public const INDEX_NAMES = [
        'skills'           => 'المهارات',
        'innovation'       => 'الابتكار',
        'intelligence'     => 'الذكاء',
        'creativity'       => 'الإبداع',
        'projects'         => 'المشاريع',
        'leadership'       => 'القيادة',
        'ip'               => 'الملكية الفكرية',
        'future_readiness' => 'الجاهزية المستقبلية',
    ];

    // ─── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ─── Scopes ──────────────────────────────────────────────

    public function scopeByClassification(Builder $query, string $classification): Builder
    {
        return $query->where('classification', $classification);
    }

    public function scopeLatestForUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId)->latest('calculated_at');
    }

    // ─── Helpers ─────────────────────────────────────────────

    /**
     * Get classification based on overall score
     */
    public static function classifyScore(float $score): string
    {
        foreach (self::CLASSIFICATIONS as $key => $range) {
            if ($score >= $range['min'] && $score <= $range['max']) {
                return $key;
            }
        }
        return 'developing';
    }

    /**
     * Get classification details
     */
    public function getClassificationDetails(): array
    {
        return self::CLASSIFICATIONS[$this->classification] ?? self::CLASSIFICATIONS['developing'];
    }

    /**
     * Get all indexes as an array
     */
    public function toIndexArray(): array
    {
        return [
            'skills'           => (float) $this->skills_index,
            'innovation'       => (float) $this->innovation_index,
            'intelligence'     => (float) $this->intelligence_index,
            'creativity'       => (float) $this->creativity_index,
            'projects'         => (float) $this->projects_index,
            'leadership'       => (float) $this->leadership_index,
            'ip'               => (float) $this->ip_index,
            'future_readiness' => (float) $this->future_readiness_index,
        ];
    }

    /**
     * Get strongest index
     */
    public function getStrongestIndex(): string
    {
        $indexes = $this->toIndexArray();
        return array_search(max($indexes), $indexes);
    }

    /**
     * Get weakest index
     */
    public function getWeakestIndex(): string
    {
        $indexes = $this->toIndexArray();
        return array_search(min($indexes), $indexes);
    }
}
