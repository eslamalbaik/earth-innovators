<?php

namespace App\Services\AIEngine;

use App\Models\Achievement;
use App\Models\AchievementAttachment;
use App\Models\User;

/**
 * AI-001 & AI-002: Achievement Validator
 *
 * Validates achievements using AI and scores evidence quality.
 */
class AchievementValidator
{
    public function __construct(
        private GeminiClient $client,
    ) {}

    /**
     * AI-001: Validate an achievement's content
     */
    public function validateAchievement(Achievement $achievement): array
    {
        $achievement->load('attachments', 'user');

        $prompt = $this->buildValidationPrompt($achievement);

        $result = $this->client->chatWithJson([
            GeminiClient::systemMessage(
                'أنت محلل متخصص في تقييم الإنجازات الأكاديمية والمهنية. مهمتك تحليل الإنجاز وإعطاء تقييم شامل بناءً على المعايير الوطنية والدولية المعتمدة. '
                . 'يجب أن تكون الإجابة بصيغة JSON تحتوي على الحقول التالية: '
                . 'is_logical (boolean), has_duplicates (boolean), is_description_clear (boolean), '
                . 'is_evidence_sufficient (boolean), confidence_score (number 0-100), '
                . 'validation_status (validated/flagged), feedback (string), suggestions (array of strings), '
                . 'standards_alignment (array of strings - أسماء المعايير التي تتوافق مع هذا الإنجاز من القائمة المرجعية)'
            ),
            GeminiClient::userMessage($prompt),
        ], temperature: 0.2, maxTokens: 1500);

        if (!$result) {
            return [
                'validation_status' => 'pending',
                'confidence_score'  => 0,
                'feedback'          => 'تعذر التحليل حالياً',
                'suggestions'       => [],
                'standards_alignment'=> [],
            ];
        }

        $achievement->update([
            'ai_validation_status' => $result['validation_status'] ?? 'pending',
            'ai_confidence_score'  => $result['confidence_score'] ?? 0,
            'ai_analysis_result'   => $result,
        ]);

        return $result;
    }

    /**
     * AI-002: Score evidence quality for an attachment
     */
    public function scoreEvidence(AchievementAttachment $attachment): int
    {
        // For file-based evidence, use rule-based scoring
        $evidenceType = $this->classifyEvidenceType($attachment);
        $baseScore = AchievementAttachment::EVIDENCE_TYPES[$evidenceType] ?? 40;

        $attachment->update([
            'ai_evidence_type'     => $evidenceType,
            'ai_confidence_score'  => $baseScore,
        ]);

        return $baseScore;
    }

    /**
     * Score all attachments for an achievement and compute average
     */
    public function scoreAllEvidence(Achievement $achievement): float
    {
        $achievement->load('attachments');

        foreach ($achievement->attachments as $attachment) {
            $this->scoreEvidence($attachment);
        }

        $avgScore = $achievement->calculateEvidenceScore();
        $achievement->update(['evidence_score' => $avgScore]);

        return $avgScore;
    }

    /**
     * Classify evidence type based on file properties
     */
    private function classifyEvidenceType(AchievementAttachment $attachment): string
    {
        if ($attachment->file_type === 'url') {
            $url = $attachment->url ?? '';
            // Check for official domains
            $officialDomains = ['.edu', '.gov', '.org', 'linkedin.com', 'coursera.org', 'udemy.com', 'edx.org'];
            foreach ($officialDomains as $domain) {
                if (str_contains($url, $domain)) {
                    return 'official_website';
                }
            }
            return 'official_website';
        }

        if ($attachment->file_type === 'pdf') {
            $name = mb_strtolower($attachment->original_name ?? '');
            if (str_contains($name, 'certificate') || str_contains($name, 'شهادة')) {
                return 'official_certificate';
            }
            return 'document';
        }

        if ($attachment->file_type === 'image') {
            return 'image';
        }

        if ($attachment->file_type === 'video') {
            return 'video';
        }

        return 'manual_entry';
    }

    /**
     * Build validation prompt
     */
    private function buildValidationPrompt(Achievement $achievement): string
    {
        $attachmentsSummary = $achievement->attachments->map(function ($a) {
            return "- نوع: {$a->file_type}, اسم: {$a->original_name}";
        })->implode("\n");

        $standards = json_encode(config('standards'), JSON_UNESCAPED_UNICODE);

        $externalLinks = $achievement->external_links
            ? json_encode($achievement->external_links, JSON_UNESCAPED_UNICODE)
            : 'لا يوجد';

        return <<<PROMPT
قم بتحليل الإنجاز التالي وتقييمه:

العنوان: {$achievement->title}
النوع: {$achievement->type_label}
الفئة: {$achievement->category}
التاريخ: {$achievement->date}
الوصف: {$achievement->description}

المرفقات:
{$attachmentsSummary}

الروابط الخارجية: {$externalLinks}

قائمة المعايير المرجعية للاستدلال بها:
{$standards}

قم بتقييم:
1. هل المحتوى منطقي ومتسق؟
2. هل الوصف واضح وكافي؟
3. هل الأدلة المرفقة كافية؟
4. هل يوجد مؤشرات على تكرار أو نسخ؟
5. ما درجة الثقة الإجمالية (0-100)؟
6. ما هي المعايير من القائمة المرجعية التي تتوافق مع هذا الإنجاز أو يمكن قياسه من خلالها (standards_alignment)؟
PROMPT;
    }
}
