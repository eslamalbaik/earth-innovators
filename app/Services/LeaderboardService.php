<?php

namespace App\Services;

use App\Models\User;
use App\Models\Challenge;
use App\Models\ChallengeParticipation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class LeaderboardService extends BaseService
{
    /**
     * Get global leaderboard (all schools)
     */
    public function getGlobalLeaderboard(int $limit = 100, ?int $schoolId = null): Collection
    {
        $cacheKey = "global_leaderboard_" . ($schoolId ?? 'all') . "_{$limit}";
        $cacheTag = 'leaderboard';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($limit, $schoolId) {
            $query = User::where('role', 'student')
                ->where('points', '>', 0)
                ->orderBy('points', 'desc')
                ->orderBy('updated_at', 'desc')
                ->limit($limit)
                ->with(['school:id,name']);

            if ($schoolId) {
                $query->where('school_id', $schoolId);
            }

            return $query->get()->map(function ($user, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'points' => $user->points,
                    'school' => $user->school ? [
                        'id' => $user->school->id,
                        'name' => $user->school->name,
                    ] : null,
                ];
            });
        }, 600); // Cache for 10 minutes
    }

    /**
     * Get challenge leaderboard
     */
    public function getChallengeLeaderboard(int $challengeId, int $limit = 100): Collection
    {
        $cacheKey = "challenge_leaderboard_{$challengeId}_{$limit}";
        $cacheTag = "challenge_{$challengeId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($challengeId, $limit) {
            return ChallengeParticipation::where('challenge_id', $challengeId)
                ->where('status', 'completed')
                ->orderBy('points_earned', 'desc')
                ->orderBy('completed_at', 'asc') // Earlier completion = better rank
                ->limit($limit)
                ->with(['user:id,name,points', 'user.school:id,name'])
                ->get()
                ->map(function ($participation, $index) {
                    // Update rank in database
                    $participation->update(['rank' => $index + 1]);

                    return [
                        'rank' => $index + 1,
                        'user_id' => $participation->user_id,
                        'name' => $participation->user->name,
                        'points_earned' => $participation->points_earned,
                        'completed_at' => $participation->completed_at,
                        'school' => $participation->user->school ? [
                            'id' => $participation->user->school->id,
                            'name' => $participation->user->school->name,
                        ] : null,
                    ];
                });
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get school leaderboard
     */
    public function getSchoolLeaderboard(int $schoolId, int $limit = 100): Collection
    {
        $cacheKey = "school_leaderboard_{$schoolId}_{$limit}";
        $cacheTag = "school_{$schoolId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($schoolId, $limit) {
            return User::where('role', 'student')
                ->where('school_id', $schoolId)
                ->where('points', '>', 0)
                ->orderBy('points', 'desc')
                ->orderBy('updated_at', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($user, $index) {
                    return [
                        'rank' => $index + 1,
                        'user_id' => $user->id,
                        'name' => $user->name,
                        'points' => $user->points,
                    ];
                });
        }, 600);
    }

    /**
     * Get user's rank globally
     */
    public function getUserGlobalRank(int $userId): ?int
    {
        $user = User::findOrFail($userId);

        if ($user->points <= 0) {
            return null;
        }

        $rank = User::where('role', 'student')
            ->where('points', '>', $user->points)
            ->orWhere(function ($query) use ($user) {
                $query->where('role', 'student')
                    ->where('points', '=', $user->points)
                    ->where('updated_at', '<', $user->updated_at);
            })
            ->count() + 1;

        return $rank;
    }

    /**
     * Get user's rank in school
     */
    public function getUserSchoolRank(int $userId): ?int
    {
        $user = User::findOrFail($userId);

        if (!$user->school_id || $user->points <= 0) {
            return null;
        }

        $rank = User::where('role', 'student')
            ->where('school_id', $user->school_id)
            ->where(function ($query) use ($user) {
                $query->where('points', '>', $user->points)
                    ->orWhere(function ($q) use ($user) {
                        $q->where('points', '=', $user->points)
                          ->where('updated_at', '<', $user->updated_at);
                    });
            })
            ->count() + 1;

        return $rank;
    }

    /**
     * Get user's rank in challenge
     */
    public function getUserChallengeRank(int $userId, int $challengeId): ?int
    {
        $participation = ChallengeParticipation::where('challenge_id', $challengeId)
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->first();

        if (!$participation) {
            return null;
        }

        return ChallengeParticipation::where('challenge_id', $challengeId)
            ->where('status', 'completed')
            ->where(function ($query) use ($participation) {
                $query->where('points_earned', '>', $participation->points_earned)
                    ->orWhere(function ($q) use ($participation) {
                        $q->where('points_earned', '=', $participation->points_earned)
                          ->where('completed_at', '<', $participation->completed_at);
                    });
            })
            ->count() + 1;
    }

    /**
     * Get top schools by total points
     */
    public function getTopSchools(int $limit = 10): Collection
    {
        $cacheKey = "top_schools_{$limit}";
        $cacheTag = 'leaderboard';

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($limit) {
            return User::where('role', 'school')
                ->withSum('students', 'points')
                ->orderBy('students_sum_points', 'desc')
                ->limit($limit)
                ->get()
                ->map(function ($school, $index) {
                    return [
                        'rank' => $index + 1,
                        'school_id' => $school->id,
                        'name' => $school->name,
                        'total_points' => $school->students_sum_points ?? 0,
                        'students_count' => $school->students()->count(),
                    ];
                });
        }, 600);
    }
}
