<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LeaderboardService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class LeaderboardApiController extends Controller
{
    public function __construct(
        private LeaderboardService $leaderboardService
    ) {}

    /**
     * Get global leaderboard
     */
    public function global(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 100);
        $schoolId = $request->get('school_id');

        $leaderboard = $this->leaderboardService->getGlobalLeaderboard($limit, $schoolId);

        return response()->json([
            'success' => true,
            'data' => [
                'leaderboard' => $leaderboard,
            ],
        ]);
    }

    /**
     * Get challenge leaderboard
     */
    public function challenge(Request $request, int $challengeId): JsonResponse
    {
        $limit = $request->get('limit', 100);

        $leaderboard = $this->leaderboardService->getChallengeLeaderboard($challengeId, $limit);

        return response()->json([
            'success' => true,
            'data' => [
                'leaderboard' => $leaderboard,
            ],
        ]);
    }

    /**
     * Get school leaderboard
     */
    public function school(Request $request, int $schoolId): JsonResponse
    {
        $limit = $request->get('limit', 100);

        $leaderboard = $this->leaderboardService->getSchoolLeaderboard($schoolId, $limit);

        return response()->json([
            'success' => true,
            'data' => [
                'leaderboard' => $leaderboard,
            ],
        ]);
    }

    /**
     * Get user's rank
     */
    public function userRank(): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $globalRank = $this->leaderboardService->getUserGlobalRank($user->id);
        $schoolRank = $this->leaderboardService->getUserSchoolRank($user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'global_rank' => $globalRank,
                'school_rank' => $schoolRank,
                'points' => $user->points,
            ],
        ]);
    }

    /**
     * Get top schools
     */
    public function topSchools(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);

        $schools = $this->leaderboardService->getTopSchools($limit);

        return response()->json([
            'success' => true,
            'data' => [
                'schools' => $schools,
            ],
        ]);
    }
}
