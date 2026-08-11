<?php

namespace App\Services\ScoringEngine;

use App\Models\User;

/**
 * AI-010: Leadership Index Calculator (0-100)
 *
 * المدخلات: المبادرات، إدارة الفرق، تقييمات المشاركين، التحديات
 */
class LeadershipIndexCalculator
{
    public function calculate(User $user, array &$metadata): float
    {
        // 1. Challenge Participation & Completion (0-30)
        $participations = $user->challengeParticipations;
        $completedChallenges = $participations->where('status', 'completed')->count();
        $challengeScore = min(30, $completedChallenges * 6);

        // 2. Projects as Leader / Creator (0-25)
        $createdProjects = $user->projects->count();
        $createdChallenges = $user->challenges->count();
        $leadershipProjects = $createdProjects + $createdChallenges;
        $projectLeaderScore = min(25, $leadershipProjects * 5);

        // 3. Reviews Received (positive feedback from others) (0-20)
        $avgReviewScore = 0;
        if (method_exists($user, 'bookings')) {
            $reviews = $user->bookings()
                ->whereHas('reviews')
                ->with('reviews')
                ->get()
                ->pluck('reviews')
                ->flatten()
                ->filter();
            $avgReviewScore = $reviews->isNotEmpty() ? $reviews->avg('rating') : 0;
        }
        $reviewScore = min(20, ($avgReviewScore / 5) * 20);

        // 4. Badges Earned (0-25)
        $leadershipBadges = $user->badges->count();
        $badgeScore = min(25, $leadershipBadges * 5);

        $total = round(min(100, $challengeScore + $projectLeaderScore + $reviewScore + $badgeScore), 2);

        $metadata['leadership'] = [
            'challenge_score'       => round($challengeScore, 2),
            'project_leader_score'  => round($projectLeaderScore, 2),
            'review_score'          => round($reviewScore, 2),
            'badge_score'           => round($badgeScore, 2),
            'completed_challenges'  => $completedChallenges,
            'leadership_projects'   => $leadershipProjects,
            'avg_review_rating'     => round($avgReviewScore, 2),
        ];

        return $total;
    }
}
