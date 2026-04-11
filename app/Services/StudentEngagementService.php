<?php

namespace App\Services;

use App\Models\Project;
use App\Models\StoreReward;
use App\Models\StoreRewardRequest;
use App\Models\UserBadge;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * بيانات موحّدة لربط الطالب بباقات الاشتراك والنقاط والإنجازات (نفس مصادر الباقات والإدارة).
 */
class StudentEngagementService
{
    public function __construct(
        private MembershipAccessService $membershipAccessService
    ) {}

    public function getSummary(User $user): array
    {
        $membershipSummary = $this->membershipAccessService->getMembershipSummary($user);
        $subscription = $membershipSummary['subscription'] ?? null;
        $pendingSubscription = $membershipSummary['pending_subscription'] ?? null;
        $points = (int) ($user->points ?? 0);
        $userId = (int) $user->id;

        $approvedProjects = (int) Project::query()
            ->where('user_id', $userId)
            ->where('status', 'approved')
            ->count();

        $badgesCount = (int) UserBadge::query()
            ->where('user_id', $userId)
            ->count();

        $activeRewardsCount = 0;
        $redeemableRewardsCount = 0;
        $minRewardCost = null;
        $rewardRequestStats = null;
        if (Schema::hasTable('store_rewards')) {
            $activeRewardsCount = (int) StoreReward::query()
                ->where('is_active', true)
                ->count();

            $redeemableRewardsCount = (int) StoreReward::query()
                ->where('is_active', true)
                ->where('points_cost', '<=', $points)
                ->count();

            $minRewardCost = StoreReward::query()
                ->where('is_active', true)
                ->min('points_cost');
        }

        if (Schema::hasTable('store_reward_requests')) {
            $rewardRequestStats = StoreRewardRequest::query()
                ->where('user_id', $userId)
                ->selectRaw('
                    SUM(CASE WHEN status = "pending" THEN 1 ELSE 0 END) as pending,
                    SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved,
                    SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected
                ')
                ->first();
        }

        $recentActions = (int) DB::table('points')
            ->where('user_id', $userId)
            ->where('created_at', '>=', now()->subDays(30))
            ->count();

        $engagementScore = $this->calculateEngagementScore(
            $points,
            $approvedProjects,
            $badgesCount,
            $recentActions
        );

        return [
            'points' => $points,
            'membership_type' => $user->membership_type,
            'engagement_score' => $engagementScore,
            'subscription' => $subscription,
            'pending_subscription' => $pendingSubscription,
            'is_school_owned' => (bool) ($membershipSummary['is_school_owned'] ?? false),
            'is_expiring_soon' => (bool) ($membershipSummary['is_expiring_soon'] ?? false),
            'needs_renewal' => (bool) ($membershipSummary['needs_renewal'] ?? false),
            'trial_available' => (bool) ($membershipSummary['trial_available'] ?? false),
            'can_subscribe' => $subscription === null && $pendingSubscription === null,
            'rewards' => [
                'active_count' => $activeRewardsCount,
                'redeemable_count' => $redeemableRewardsCount,
                'min_cost' => $minRewardCost !== null ? (int) $minRewardCost : null,
                'pending_requests' => (int) ($rewardRequestStats?->pending ?? 0),
                'approved_requests' => (int) ($rewardRequestStats?->approved ?? 0),
                'rejected_requests' => (int) ($rewardRequestStats?->rejected ?? 0),
            ],
        ];
    }

    private function calculateEngagementScore(
        int $points,
        int $approvedProjects,
        int $badgesCount,
        int $recentActions
    ): int {
        $pointsScore = min(40, (int) round(($points / 200) * 40));
        $projectScore = min(25, (int) round(($approvedProjects / 4) * 25));
        $badgesScore = min(20, (int) round(($badgesCount / 5) * 20));
        $activityScore = min(15, (int) round(($recentActions / 10) * 15));

        return max(0, min(100, $pointsScore + $projectScore + $badgesScore + $activityScore));
    }
}
