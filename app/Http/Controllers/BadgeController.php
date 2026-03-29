<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Services\BadgeService;
use App\Services\PointsService;
use App\Services\RankingService;
use App\Services\StoreRewardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function __construct(
        private BadgeService $badgeService,
        private RankingService $rankingService,
        private StoreRewardService $storeRewardService,
        private PointsService $pointsService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $currentSchoolId = null;
        if ($user) {
            if ($user->isSchool()) {
                $currentSchoolId = $user->id;
            } elseif ($user->isStudent() && $user->school_id) {
                $currentSchoolId = $user->school_id;
            } elseif ($user->isTeacher() && $user->school_id) {
                $currentSchoolId = $user->school_id;
            }
        }

        $allBadges = $this->badgeService->getActiveBadges($currentSchoolId);
        $achievementBadges = $allBadges->filter(fn ($badge) => $badge->badge_category === 'achievement')->values();
        $communityBadges = $allBadges->filter(fn ($badge) => $badge->badge_category === 'community')->values();

        $userBadges = [];
        $userCommunityBadgeProgress = [];
        if ($user) {
            $userId = $user->id;
            $userBadges = $this->badgeService->getUserBadges($userId);
            $userCommunityBadgeProgress = $this->badgeService->getUserCommunityBadgeProgress($userId);
        }

        $rankings = $this->rankingService->getSchoolRankings($currentSchoolId);

        return Inertia::render('Badges', [
            'achievementBadges' => $achievementBadges,
            'communityBadges' => $communityBadges,
            'userBadges' => $userBadges,
            'userCommunityBadgeProgress' => $userCommunityBadgeProgress,
            'schoolsRanking' => $rankings['schoolsRanking'],
            'currentSchoolRank' => $rankings['currentSchoolRank'],
        ]);
    }

    public function show($id)
    {
        $badge = Badge::findOrFail($id);

        $userHasBadge = false;
        if (auth()->check()) {
            $userHasBadge = $this->badgeService->userHasBadge(auth()->id(), $id);
        }

        return Inertia::render('Badges/Show', [
            'badge' => $badge,
            'userHasBadge' => $userHasBadge,
        ]);
    }

    public function achievements(Request $request)
    {
        $user = $request->user();
        $userBadges = [];
        $recentAchievements = [];
        $points = 0;

        if ($user) {
            $points = $user->points ?? 0;
            $userBadges = $this->badgeService->getUserBadges($user->id);
            $pointsHistory = $this->pointsService->getUserPointsHistory($user->id, 10);

            $recentAchievements = $pointsHistory->getCollection()->map(function ($point) {
                return [
                    'id' => $point->id,
                    'title' => $point->description_ar ?? $point->description ?? 'إنجاز جديد',
                    'description' => $point->description_ar ?? $point->description ?? 'حصلت على نقاط جديدة',
                    'points' => $point->points,
                    'created_at' => $point->created_at,
                ];
            })->toArray();
        }

        return Inertia::render('Achievements', [
            'user' => $user,
            'badges' => $userBadges,
            'points' => $points,
            'recentAchievements' => $recentAchievements,
            'learnerLevels' => $this->buildLearnerLevelsForDisplay(),
            'pointsDistribution' => $this->buildPointsDistributionForDisplay(),
        ]);
    }

    public function storeMembership(Request $request)
    {
        $user = $request->user();
        $currentBalance = $user ? (int) ($user->points ?? 0) : 0;
        $redeemableItems = $this->storeRewardService->getRedeemableItemsForUser($user);

        return Inertia::render('StoreMembership', [
            'user' => $user,
            'currentBalance' => $currentBalance,
            'redeemableItems' => $redeemableItems,
        ]);
    }

    public function redeemStore(Request $request): JsonResponse
    {
        $request->validate([
            'reward_id' => 'required|string|max:64',
        ]);

        $user = $request->user();
        if (! $user) {
            return response()->json(['success' => false, 'message_key' => 'toastMessages.authLoginFirst'], 401);
        }

        if (! $user->isStudent()) {
            return response()->json(['success' => false, 'message_key' => 'toastMessages.storeRewardStudentsOnly'], 403);
        }

        $result = $this->storeRewardService->redeem($user, $request->input('reward_id'));

        if (! $result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }

    private function buildLearnerLevelsForDisplay(): array
    {
        return collect(config('achievements_display.learner_levels', []))->map(function ($row) {
            return [
                'title' => trans($row['title_key']),
                'points' => trans($row['points_key']),
                'gradient' => $row['gradient'],
                'rightIcon' => $row['right_icon'],
                'leftIconKey' => $row['left_icon'],
            ];
        })->all();
    }

    private function buildPointsDistributionForDisplay(): array
    {
        return collect(config('achievements_display.points_distribution', []))->map(function ($row) {
            return [
                'type' => trans($row['type_key']),
                'icon' => $row['icon'],
                'points' => trans($row['points_key']),
                'multiplier' => trans('achievementsPage.pointsDistribution.multiplier', ['count' => $row['multiplier_count']]),
                'total' => trans('achievementsPage.pointsDistribution.total', ['total' => $row['total']]),
                'color' => $row['color'],
                'iconBg' => $row['icon_bg'],
            ];
        })->all();
    }
}
