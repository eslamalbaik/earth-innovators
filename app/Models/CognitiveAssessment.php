<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * تقييم القدرات المعرفية (مقياس ستانفورد-بينيه، الصورة الخامسة)
 */
class CognitiveAssessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'entered_by',
        'assessor_name',
        'assessment_date',
        'full_scale_iq',
        'verbal_iq',
        'nonverbal_iq',
        'fluid_reasoning',
        'knowledge',
        'quantitative_reasoning',
        'visual_spatial',
        'working_memory',
        'percentile_ranks',
        'composite_abilities',
        'strengths',
        'weaknesses',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'assessment_date'     => 'date',
            'percentile_ranks'    => 'array',
            'composite_abilities' => 'array',
            'strengths'           => 'array',
            'weaknesses'          => 'array',
        ];
    }

    /**
     * العوامل الخمسة الكبرى
     */
    public const FACTOR_NAMES = [
        'fluid_reasoning'        => 'الاستدلال السائل',
        'knowledge'              => 'المعرفة',
        'quantitative_reasoning' => 'الاستدلال الكمي',
        'visual_spatial'         => 'المعالجة البصرية المكانية',
        'working_memory'         => 'الذاكرة العاملة',
    ];

    // ─── Relationships ───────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enteredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'entered_by');
    }

    // ─── Helpers ─────────────────────────────────────────────

    /**
     * تصنيف الدرجة المعيارية (متوسط 100، انحراف معياري 15)
     */
    public static function classifyStandardScore(int $score): string
    {
        return match (true) {
            $score >= 130 => 'متفوق جداً',
            $score >= 120 => 'متفوق',
            $score >= 110 => 'فوق المتوسط',
            $score >= 90  => 'متوسط',
            $score >= 80  => 'أقل من المتوسط',
            $score >= 70  => 'ضعف بيني',
            default       => 'متأخر',
        };
    }

    /**
     * العوامل الخمسة كمصفوفة
     */
    public function toFactorArray(): array
    {
        return [
            'fluid_reasoning'        => $this->fluid_reasoning,
            'knowledge'              => $this->knowledge,
            'quantitative_reasoning' => $this->quantitative_reasoning,
            'visual_spatial'         => $this->visual_spatial,
            'working_memory'         => $this->working_memory,
        ];
    }

    /**
     * ملخص نصي للاستخدام في prompts الذكاء الاصطناعي
     */
    public function toPromptSummary(): string
    {
        $lines = [];

        if ($this->full_scale_iq) {
            $lines[] = "نسبة ذكاء المقياس الكلي: {$this->full_scale_iq} (" . self::classifyStandardScore($this->full_scale_iq) . ')';
        }

        foreach (self::FACTOR_NAMES as $key => $label) {
            $score = $this->$key;
            if ($score !== null) {
                $lines[] = "- {$label}: {$score} (" . self::classifyStandardScore($score) . ')';
            }
        }

        if (!empty($this->strengths)) {
            $lines[] = 'نقاط القوة المعرفية: ' . implode('، ', $this->strengths);
        }

        if (!empty($this->weaknesses)) {
            $lines[] = 'نقاط الضعف المعرفية: ' . implode('، ', $this->weaknesses);
        }

        return implode("\n", $lines);
    }
}
