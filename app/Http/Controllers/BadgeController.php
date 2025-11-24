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
        $badges = $this->badgeService->getActiveBadges();

        $userBadges = [];
        if ($request->user()) {
            $userBadges = $this->badgeService->getUserBadges($request->user()->id);
        }

        // Get school rankings (available for all users)
        $currentSchoolId = null;
        if ($request->user() && $request->user()->isSchool()) {
            $currentSchoolId = $request->user()->id;
        }
        $rankings = $this->rankingService->getSchoolRankings($currentSchoolId);

        return Inertia::render('Badges', [
            'badges' => $badges,
            'userBadges' => $userBadges,
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
}
