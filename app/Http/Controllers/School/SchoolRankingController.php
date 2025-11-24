<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Services\RankingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolRankingController extends Controller
{
    public function __construct(
        private RankingService $rankingService
    ) {}

    public function index(Request $request)
    {
        $school = Auth::user();
        
        $rankings = $this->rankingService->getSchoolRankings($school->id);
        $badges = $this->rankingService->getSchoolBadges($school->id);
        
        return Inertia::render('School/Ranking', [
            'schoolsRanking' => $rankings['schoolsRanking'],
            'currentSchoolRank' => $rankings['currentSchoolRank'],
            'badges' => $badges['badges'],
            'earnedBadges' => $badges['earnedBadges'],
        ]);
    }
}
