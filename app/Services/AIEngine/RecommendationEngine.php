<?php

namespace App\Services\AIEngine;

use App\Models\User;
use App\Models\InnovationIndex;

/**
 * AI-015 to AI-019: Recommendation Engine
 *
 * Generates personalized recommendations based on user indexes and achievements.
 */
class RecommendationEngine
{
    public function __construct(
        private GeminiClient $client,
    ) {}

    /**
     * AI-015: Generate comprehensive recommendations
     */
    public function generateRecommendations(User $user): array
    {
        $user->load(['latestInnovationIndex', 'achievements', 'userSkills']);
        $index = $user->latestInnovationIndex;

        if (!$index) {
            return ['recommendations' => [], 'message' => 'لم يتم حساب المؤشرات بعد'];
        }

        $prompt = $this->buildRecommendationPrompt($user, $index);

        $result = $this->client->chatWithJson([
            GeminiClient::systemMessage(
                'أنت مستشار تطوير مهني متخصص في تطوير المبتكرين. '
                . 'بناءً على مؤشرات الطالب، قم بتوليد توصيات مخصصة لتحسين أدائه. '
                . 'أجب بصيغة JSON مع الحقول: '
                . 'general_recommendations (array of {title, description, priority: high/medium/low, target_index}), '
                . 'courses (array of {title, description, provider, target_index}), '
                . 'competitions (array of {title, description, type}), '
                . 'projects (array of {title, description, skills_needed}), '
                . 'collaborators_criteria (array of {skill, reason}), '
                . 'strengths (array of strings), '
                . 'weaknesses (array of strings), '
                . 'overall_advice (string), '
                . 'student_level_profile (object with {current_level (e.g. L1 to L5), score, strengths (array), learning_gaps (array), acquired_skills (array), achieved_outcomes (array), next_challenge, target_level})'
            ),
            GeminiClient::userMessage($prompt),
        ], temperature: 0.4, maxTokens: 4000);

        return $result ?? [
            'general_recommendations' => [],
            'courses'                 => [],
            'competitions'            => [],
            'projects'                => [],
            'collaborators_criteria'  => [],
            'strengths'               => [],
            'weaknesses'              => [],
            'overall_advice'          => 'تعذر توليد التوصيات حالياً.',
            'student_level_profile'   => null,
        ];
    }

    /**
     * AI-016: Suggest training courses
     */
    public function suggestCourses(User $user): array
    {
        $recommendations = $this->generateRecommendations($user);
        return $recommendations['courses'] ?? [];
    }

    /**
     * AI-017: Suggest competitions
     */
    public function suggestCompetitions(User $user): array
    {
        $recommendations = $this->generateRecommendations($user);
        return $recommendations['competitions'] ?? [];
    }

    /**
     * AI-018: Suggest suitable projects
     */
    public function suggestProjects(User $user): array
    {
        $recommendations = $this->generateRecommendations($user);
        return $recommendations['projects'] ?? [];
    }

    /**
     * AI-019: Suggest collaborators criteria
     */
    public function suggestCollaborators(User $user): array
    {
        $recommendations = $this->generateRecommendations($user);
        return $recommendations['collaborators_criteria'] ?? [];
    }

    /**
     * Build recommendation prompt with user data
     */
    private function buildRecommendationPrompt(User $user, InnovationIndex $index): string
    {
        $skillsList = $user->userSkills->pluck('name')->implode('، ');
        $achievementsSummary = $user->achievements
            ->groupBy('type')
            ->map(fn($group) => $group->count())
            ->toArray();

        $achievementsText = collect($achievementsSummary)
            ->map(fn($count, $type) => "{$type}: {$count}")
            ->implode(', ');

        $classification = $index->getClassificationDetails();

        return <<<PROMPT
بيانات المستخدم:
الاسم: {$user->name}
التصنيف: {$classification['label']} ({$index->classification})
الدرجة الإجمالية: {$index->overall_score}/100

المؤشرات:
- المهارات: {$index->skills_index}/100
- الابتكار: {$index->innovation_index}/100
- الذكاء: {$index->intelligence_index}/100
- الإبداع: {$index->creativity_index}/100
- المشاريع: {$index->projects_index}/100
- القيادة: {$index->leadership_index}/100
- الملكية الفكرية: {$index->ip_index}/100
- الجاهزية المستقبلية: {$index->future_readiness_index}/100

المهارات: {$skillsList}

الإنجازات: {$achievementsText}

أقوى مؤشر: {$index->getStrongestIndex()}
أضعف مؤشر: {$index->getWeakestIndex()}
{$this->buildCognitiveSection($user)}
بناءً على هذه البيانات، قدم توصيات مفصلة لتحسين أداء المستخدم مع التركيز على نقاط الضعف.
PROMPT;
    }

    /**
     * ملخص التقييم المعرفي (ستانفورد-بينيه) إن وُجد —
     * يوجه التوصيات وفق العوامل الخمسة (مثال: استدلال سائل مرتفع ← تحديات خوارزميات)
     */
    private function buildCognitiveSection(User $user): string
    {
        $assessment = $user->latestCognitiveAssessment;

        if (!$assessment) {
            return '';
        }

        return "\nالملف المعرفي (مقياس ستانفورد-بينيه):\n"
            . $assessment->toPromptSummary()
            . "\nراعِ هذا الملف المعرفي في التوصيات: اقترح أنشطة تستثمر العوامل المرتفعة وتمارين تقوّي العوامل الضعيفة.\n";
    }
}
