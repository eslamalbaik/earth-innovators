<?php

namespace App\Services\ScoringEngine;

use App\Models\User;

/**
 * AI-011: Intellectual Property (IP) Index Calculator (0-100)
 *
 * المدخلات: الكتب، براءات الاختراع، الأبحاث، حقوق النشر
 */
class IPIndexCalculator
{
    public function calculate(User $user, array &$metadata): float
    {
        $achievements = $user->achievements;
        $publications = $user->publications;

        // 1. Patents (0-35)
        $patents = $achievements->where('type', 'patent')->count();
        $patentsScore = min(35, $patents * 18);

        // 2. Research Publications (0-25)
        $research = $achievements->where('type', 'research')
            ->where('ai_validation_status', 'validated')
            ->count();
        $platformPubs = $publications->count();
        $researchScore = min(25, ($research + $platformPubs) * 5);

        // 3. Articles & Books (0-20)
        $articles = $achievements->where('type', 'article')->count();
        $articlesScore = min(20, $articles * 5);

        // 4. Evidence Quality of IP Achievements (0-20)
        $ipAchievements = $achievements->whereIn('type', ['patent', 'research', 'article']);
        $avgEvidence = $ipAchievements->isNotEmpty()
            ? $ipAchievements->avg('evidence_score') ?? 0
            : 0;
        $evidenceScore = min(20, ($avgEvidence / 100) * 20);

        $total = round(min(100, $patentsScore + $researchScore + $articlesScore + $evidenceScore), 2);

        $metadata['ip'] = [
            'patents_score'  => round($patentsScore, 2),
            'research_score' => round($researchScore, 2),
            'articles_score' => round($articlesScore, 2),
            'evidence_score' => round($evidenceScore, 2),
            'total_patents'  => $patents,
            'total_research' => $research + $platformPubs,
            'total_articles' => $articles,
        ];

        return $total;
    }
}
