<?php

namespace App\Services\AIEngine;

/**
 * AI-003: Content Analyzer
 *
 * Analyzes text content for originality, impact, innovation level, etc.
 */
class ContentAnalyzer
{
    public function __construct(
        private DeepSeekClient $client,
    ) {}

    /**
     * Full content analysis
     */
    public function analyze(string $content, string $type = 'general'): array
    {
        $result = $this->client->chatWithJson([
            DeepSeekClient::systemMessage(
                'أنت محلل محتوى متخصص. قم بتحليل النص المقدم وأعطِ تقييمات رقمية (0-100) لكل من: '
                . 'originality (الأصالة)، impact (التأثير)، innovation_level (مستوى الابتكار)، '
                . 'writing_quality (جودة الكتابة)، scientific_value (القيمة العلمية). '
                . 'أيضاً استخرج keywords (كلمات مفتاحية كمصفوفة)، و summary (ملخص قصير). '
                . 'أجب بصيغة JSON فقط.'
            ),
            DeepSeekClient::userMessage(
                "نوع المحتوى: {$type}\n\nالمحتوى:\n{$content}"
            ),
        ]);

        return $result ?? [
            'originality'      => 0,
            'impact'           => 0,
            'innovation_level' => 0,
            'writing_quality'  => 0,
            'scientific_value' => 0,
            'keywords'         => [],
            'summary'          => '',
        ];
    }

    /**
     * Analyze originality only
     */
    public function analyzeOriginality(string $content): float
    {
        $result = $this->analyze($content);
        return (float) ($result['originality'] ?? 0);
    }

    /**
     * Analyze impact only
     */
    public function analyzeImpact(string $content): float
    {
        $result = $this->analyze($content);
        return (float) ($result['impact'] ?? 0);
    }

    /**
     * Extract keywords
     */
    public function extractKeywords(string $content): array
    {
        $result = $this->analyze($content);
        return $result['keywords'] ?? [];
    }
}
