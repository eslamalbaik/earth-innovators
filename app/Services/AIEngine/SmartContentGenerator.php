<?php

namespace App\Services\AIEngine;

use App\Models\User;

/**
 * Smart Content Generator
 *
 * Uses AI to generate articles, project descriptions, portfolios, CVs, and recommendation letters.
 */
class SmartContentGenerator
{
    public function __construct(
        private DeepSeekClient $client,
    ) {}

    /**
     * Generate an article on a topic
     */
    public function generateArticle(string $topic, User $user): string
    {
        $result = $this->client->chat([
            DeepSeekClient::systemMessage(
                'أنت كاتب محتوى محترف. اكتب مقالاً متكاملاً وعالي الجودة باللغة العربية.'
            ),
            DeepSeekClient::userMessage(
                "اكتب مقالاً عن: {$topic}\n"
                . "الكاتب: {$user->name}\n"
                . "المؤسسة: {$user->institution}\n"
                . "اكتب المقال بأسلوب أكاديمي مهني."
            ),
        ], temperature: 0.6, maxTokens: 3000);

        return $result ?? 'تعذر توليد المقال.';
    }

    /**
     * Generate project description
     */
    public function generateProjectDescription(string $projectTitle, string $brief, User $user): string
    {
        $result = $this->client->chat([
            DeepSeekClient::systemMessage(
                'أنت خبير في كتابة أوصاف المشاريع التقنية والابتكارية. اكتب وصفاً احترافياً وشاملاً.'
            ),
            DeepSeekClient::userMessage(
                "عنوان المشروع: {$projectTitle}\nملخص: {$brief}\nصاحب المشروع: {$user->name}"
            ),
        ], temperature: 0.5);

        return $result ?? 'تعذر توليد وصف المشروع.';
    }

    /**
     * Generate portfolio summary
     */
    public function generatePortfolio(User $user): string
    {
        $user->load(['achievements', 'userSkills', 'qualifications', 'latestInnovationIndex']);

        $skills = $user->userSkills->pluck('name')->implode('، ');
        $achievements = $user->achievements->map(fn($a) => "- {$a->title} ({$a->type_label})")->implode("\n");
        $index = $user->latestInnovationIndex;

        $result = $this->client->chat([
            DeepSeekClient::systemMessage(
                'أنت خبير في إعداد ملفات الإنجاز المهنية. أنشئ ملف إنجاز شامل ومنظم باللغة العربية.'
            ),
            DeepSeekClient::userMessage(
                "الاسم: {$user->name}\n"
                . "المؤسسة: {$user->institution}\n"
                . "المهارات: {$skills}\n"
                . "الإنجازات:\n{$achievements}\n"
                . ($index ? "التصنيف: {$index->getClassificationDetails()['label']}\nالدرجة: {$index->overall_score}/100" : '')
            ),
        ], temperature: 0.4, maxTokens: 4000);

        return $result ?? 'تعذر توليد ملف الإنجاز.';
    }

    /**
     * Generate CV
     */
    public function generateCV(User $user): string
    {
        $user->load(['achievements', 'userSkills', 'qualifications']);

        $qualifications = $user->qualifications->map(
            fn($q) => "- {$q->title} في {$q->institution} ({$q->field})"
        )->implode("\n");

        $skills = $user->userSkills->pluck('name')->implode('، ');
        $achievements = $user->achievements->map(fn($a) => "- {$a->title}")->implode("\n");

        $result = $this->client->chat([
            DeepSeekClient::systemMessage(
                'أنت خبير في كتابة السير الذاتية المهنية. أنشئ سيرة ذاتية مهنية وشاملة باللغة العربية.'
            ),
            DeepSeekClient::userMessage(
                "الاسم: {$user->name}\nالبريد: {$user->email}\n"
                . "المؤسسة: {$user->institution}\n"
                . "نبذة: {$user->bio}\n"
                . "المؤهلات:\n{$qualifications}\n"
                . "المهارات: {$skills}\n"
                . "الإنجازات:\n{$achievements}"
            ),
        ], temperature: 0.3, maxTokens: 3000);

        return $result ?? 'تعذر توليد السيرة الذاتية.';
    }

    /**
     * Generate recommendation letter
     */
    public function generateRecommendationLetter(User $user, string $purpose = 'عام'): string
    {
        $user->load(['achievements', 'latestInnovationIndex']);
        $index = $user->latestInnovationIndex;

        $result = $this->client->chat([
            DeepSeekClient::systemMessage(
                'أنت خبير في كتابة خطابات التوصية الأكاديمية والمهنية. اكتب خطاب توصية رسمي ومهني.'
            ),
            DeepSeekClient::userMessage(
                "اكتب خطاب توصية لـ: {$user->name}\n"
                . "الغرض: {$purpose}\n"
                . "المؤسسة: {$user->institution}\n"
                . "عدد الإنجازات: {$user->achievements->count()}\n"
                . ($index ? "التصنيف: {$index->getClassificationDetails()['label']}\nالدرجة: {$index->overall_score}/100" : '')
            ),
        ], temperature: 0.4, maxTokens: 2000);

        return $result ?? 'تعذر توليد خطاب التوصية.';
    }
}
