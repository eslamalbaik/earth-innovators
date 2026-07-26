<?php

namespace App\Services\ScoringEngine;

use App\Models\User;

/**
 * AI-007: Intelligence Index Calculator (0-100)
 *
 * المدخلات: الاختبارات، الأبحاث، التقارير، التحليل المعرفي
 */
class IntelligenceIndexCalculator
{
    public function calculate(User $user, array &$metadata): float
    {
        $achievements = $user->achievements;

        // 1. Research Publications (0-30)
        $research = $achievements->where('type', 'research')
            ->where('ai_validation_status', 'validated')
            ->count();
        $researchScore = min(30, $research * 10);

        // 2. Certificates & Test Scores (0-30)
        $certs = $achievements->where('type', 'certificate')->count();
        $platformCerts = $user->certificates->count();
        $testScore = min(30, ($certs + $platformCerts) * 5);

        // 3. Articles & Reports (0-20)
        $articles = $achievements->where('type', 'article')->count();
        $articlesScore = min(20, $articles * 5);

        // 4. AI Content Analysis Score (0-20)
        // Average confidence score from AI analysis of research/article achievements
        $analyzedAchievements = $achievements
            ->whereIn('type', ['research', 'article'])
            ->whereNotNull('ai_confidence_score');
        $aiAnalysisScore = $analyzedAchievements->isNotEmpty()
            ? min(20, ($analyzedAchievements->avg('ai_confidence_score') / 100) * 20)
            : 0;

        $total = round(min(100, $researchScore + $testScore + $articlesScore + $aiAnalysisScore), 2);

        $metadata['intelligence'] = [
            'research_score'    => round($researchScore, 2),
            'test_score'        => round($testScore, 2),
            'articles_score'    => round($articlesScore, 2),
            'ai_analysis_score' => round($aiAnalysisScore, 2),
            'total_research'    => $research,
            'total_certificates' => $certs + $platformCerts,
        ];

        return $total;
    }
}
