<?php

namespace App\Services\ScoringEngine;

use App\Models\User;

/**
 * AI-008: Creativity Index Calculator (0-100)
 *
 * المدخلات: التصاميم، الأفكار، المقالات، المشاريع الإبداعية
 */
class CreativityIndexCalculator
{
    public function calculate(User $user, array &$metadata): float
    {
        $achievements = $user->achievements;

        // 1. Creative Projects & Products (0-30)
        $creativeProjects = $achievements->whereIn('type', ['project', 'product'])->count();
        $creativeScore = min(30, $creativeProjects * 7);

        // 2. Articles & Written Content (0-25)
        $articles = $achievements->where('type', 'article')->count();
        $articlesScore = min(25, $articles * 6);

        // 3. Awards in creative fields (0-25)
        $awards = $achievements->where('type', 'award')->count();
        $awardsScore = min(25, $awards * 8);

        // 4. Content Diversity Bonus (0-20)
        // More diverse achievement types indicate broader creativity
        $typesUsed = $achievements->pluck('type')->unique()->count();
        $diversityScore = min(20, $typesUsed * 3);

        $total = round(min(100, $creativeScore + $articlesScore + $awardsScore + $diversityScore), 2);

        $metadata['creativity'] = [
            'creative_projects_score' => round($creativeScore, 2),
            'articles_score'          => round($articlesScore, 2),
            'awards_score'            => round($awardsScore, 2),
            'diversity_score'         => round($diversityScore, 2),
            'creative_projects_count' => $creativeProjects,
            'types_used'              => $typesUsed,
        ];

        return $total;
    }
}
