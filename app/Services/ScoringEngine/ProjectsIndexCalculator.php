<?php

namespace App\Services\ScoringEngine;

use App\Models\User;

/**
 * AI-009: Projects Index Calculator (0-100)
 *
 * المدخلات: جودة المشروع، نسبة الإنجاز، الأثر
 */
class ProjectsIndexCalculator
{
    public function calculate(User $user, array &$metadata): float
    {
        $platformProjects = $user->projects;
        $achievementProjects = $user->achievements->where('type', 'project');

        $totalProjects = $platformProjects->count() + $achievementProjects->count();

        if ($totalProjects === 0) {
            $metadata['projects'] = [
                'quality_score'    => 0,
                'completion_score' => 0,
                'impact_score'     => 0,
                'quantity_score'   => 0,
                'total_projects'   => 0,
            ];
            return 0;
        }

        // 1. Project Quality (0-35)
        // Based on submissions with ratings
        $ratedSubmissions = $user->projects()
            ->whereHas('submissions', fn($q) => $q->whereNotNull('rating'))
            ->get();
        $avgRating = $ratedSubmissions->isNotEmpty()
            ? $ratedSubmissions->flatMap->submissions->avg('rating')
            : 0;
        $qualityScore = min(35, ($avgRating / 5) * 35); // Assuming 5-point scale

        // 2. Completion Rate (0-25)
        $completedProjects = $platformProjects->where('status', 'completed')->count();
        $completionRate = $totalProjects > 0 ? ($completedProjects / $totalProjects) : 0;
        $completionScore = $completionRate * 25;

        // 3. Project Validation (0-20)
        $validatedAchievementProjects = $achievementProjects
            ->where('ai_validation_status', 'validated')
            ->count();
        $validationScore = min(20, $validatedAchievementProjects * 5);

        // 4. Quantity Bonus (0-20)
        $quantityScore = min(20, $totalProjects * 4);

        $total = round(min(100, $qualityScore + $completionScore + $validationScore + $quantityScore), 2);

        $metadata['projects'] = [
            'quality_score'    => round($qualityScore, 2),
            'completion_score' => round($completionScore, 2),
            'validation_score' => round($validationScore, 2),
            'quantity_score'   => round($quantityScore, 2),
            'total_projects'   => $totalProjects,
            'completed'        => $completedProjects,
            'avg_rating'       => round($avgRating, 2),
        ];

        return $total;
    }
}
