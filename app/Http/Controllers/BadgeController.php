<?php

namespace App\Http\Controllers;

use App\Models\Badge;
use App\Services\BadgeService;
use App\Services\RankingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BadgeController extends Controller
{
    public function __construct(
        private BadgeService $badgeService,
        private RankingService $rankingService
    ) {}

    public function index(Request $request)
    {
        $allBadges = $this->badgeService->getActiveBadges();

        // Separate badges by category
        $achievementBadges = $allBadges->filter(fn($badge) => $badge->badge_category === 'achievement')->values();
        $communityBadges = $allBadges->filter(fn($badge) => $badge->badge_category === 'community')->values();

        $userBadges = [];
        $userCommunityBadgeProgress = [];
        if ($request->user()) {
            $userId = $request->user()->id;
            $userBadges = $this->badgeService->getUserBadges($userId);
            $userCommunityBadgeProgress = $this->badgeService->getUserCommunityBadgeProgress($userId);
        }

        // Get school rankings (available for all users)
        $currentSchoolId = null;
        $user = $request->user();
        if ($user) {
            if ($user->isSchool()) {
                $currentSchoolId = $user->id;
            } elseif ($user->isStudent() && $user->school_id) {
                // للطلاب: إظهار ترتيب مدرستهم
                $currentSchoolId = $user->school_id;
            } elseif ($user->isTeacher() && $user->school_id) {
                // للمعلمين: إظهار ترتيب مدرستهم
                $currentSchoolId = $user->school_id;
            }
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

    /**
     * صفحة الإنجازات والنقاط
     */
    public function achievements(Request $request)
    {
        $user = $request->user();
        $userBadges = [];
        $recentAchievements = [];
        $points = 0;

        if ($user) {
            $points = $user->points ?? 0;
            $userBadges = $this->badgeService->getUserBadges($user->id);
            
            // Get recent achievements (points history)
            $pointsService = app(\App\Services\PointsService::class);
            $pointsHistory = $pointsService->getUserPointsHistory($user->id, 5);
            
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
        ]);
    }

    /**
     * صفحة بطاقة عضوية المتجر
     */
    public function storeMembership(Request $request)
    {
        $user = $request->user();
        $currentBalance = $user ? ($user->points ?? 0) : 0;
        
        // Get redeemable items (you can fetch from database or use default)
        $redeemableItems = [];
        
        // TODO: Fetch redeemable items from database if you have a model for it
        
        return Inertia::render('StoreMembership', [
            'user' => $user,
            'currentBalance' => $currentBalance,
            'redeemableItems' => $redeemableItems,
        ]);
    }
}
