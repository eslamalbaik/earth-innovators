<?php

namespace App\Services\ScoringEngine;

use App\Models\User;

/**
 * AI-006: Innovation Index Calculator (0-100)
 *
 * المدخلات: المشاريع المبتكرة، الجوائز، الأفكار، براءات الاختراع
 */
class InnovationIndexCalculator
{
    public function calculate(User $user, array &$metadata): float
    {
        $achievements = $user->achievements;

        // 1. Innovative Projects (0-30)
        $innovativeProjects = $achievements->where('type', 'project')
            ->where('ai_validation_status', 'validated')
            ->count();
        $projectsScore = min(30, $innovativeProjects * 8);

        // 2. Awards (0-25)
        $awards = $achievements->where('type', 'award')->count();
        $awardsScore = min(25, $awards * 10);

        // 3. Ideas / Products (0-20)
        $products = $achievements->where('type', 'product')->count();
        $articles = $achievements->where('type', 'article')->count();
        $ideasScore = min(20, ($products + $articles) * 5);

        // 4. Patents (0-25)
        $patents = $achievements->where('type', 'patent')->count();
        $patentsScore = min(25, $patents * 15);

        $total = round(min(100, $projectsScore + $awardsScore + $ideasScore + $patentsScore), 2);

        $metadata['innovation'] = [
            'projects_score'     => round($projectsScore, 2),
            'awards_score'       => round($awardsScore, 2),
            'ideas_score'        => round($ideasScore, 2),
            'patents_score'      => round($patentsScore, 2),
            'innovative_projects' => $innovativeProjects,
            'total_awards'       => $awards,
            'total_patents'      => $patents,
        ];

        return $total;
    }
}
