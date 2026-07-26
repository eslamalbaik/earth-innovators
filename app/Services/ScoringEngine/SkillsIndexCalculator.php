<?php

namespace App\Services\ScoringEngine;

use App\Models\User;
use App\Models\UserSkill;

/**
 * AI-005: Skills Index Calculator (0-100)
 *
 * المدخلات: المهارات، تنوعها، مستوى الإتقان، الدورات، الخبرة
 */
class SkillsIndexCalculator
{
    /**
     * Calculate skills index for a user
     */
    public function calculate(User $user, array &$metadata): float
    {
        $skills = $user->userSkills;
        $achievements = $user->achievements;
        $certificates = $user->certificates;

        // 1. Skill Diversity (0-25)
        $uniqueCategories = $skills->pluck('category')->filter()->unique()->count();
        $totalKnownCategories = max(10, $uniqueCategories); // At least 10 categories known
        $skillDiversity = min(25, ($uniqueCategories / $totalKnownCategories) * 25);

        // 2. Proficiency Average (0-30)
        $proficiencyValues = $skills->map(fn(UserSkill $s) => $s->getProficiencyNumericValue());
        $proficiencyAvg = $proficiencyValues->isNotEmpty()
            ? ($proficiencyValues->avg() / 100) * 30
            : 0;

        // 3. Courses & Certificates Score (0-25)
        $certCount = $certificates->count();
        $skillAchievements = $achievements->where('type', 'certificate')->count();
        $totalCourses = $certCount + $skillAchievements;
        $coursesScore = min(25, $totalCourses * 3);

        // 4. Skills Count Bonus (0-20)
        $skillsCount = $skills->count();
        $skillsCountScore = min(20, $skillsCount * 2);

        $total = round(min(100, $skillDiversity + $proficiencyAvg + $coursesScore + $skillsCountScore), 2);

        $metadata['skills'] = [
            'skill_diversity'   => round($skillDiversity, 2),
            'proficiency_avg'   => round($proficiencyAvg, 2),
            'courses_score'     => round($coursesScore, 2),
            'skills_count_score' => round($skillsCountScore, 2),
            'total_skills'      => $skillsCount,
            'unique_categories' => $uniqueCategories,
            'total_certificates' => $totalCourses,
        ];

        return $total;
    }
}
