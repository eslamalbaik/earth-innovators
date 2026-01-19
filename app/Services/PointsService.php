<?php

namespace App\Services;

use App\Models\Point;
use App\Models\User;
use App\Models\Challenge;
use App\Models\ChallengeParticipation;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PointsService extends BaseService
{
    /**
     * Award points to a user
     */
    public function awardPoints(
        int $userId,
        int $points,
        string $source,
        ?int $sourceId = null,
        ?string $description = null,
        ?string $descriptionAr = null,
        string $type = 'earned'
    ): Point {
        DB::beginTransaction();
        try {
            $user = User::findOrFail($userId);

            // Create point record
            $point = Point::create([
                'user_id' => $userId,
                'points' => $points,
                'type' => $type,
                'source' => $source,
                'source_id' => $sourceId,
                'description' => $description,
                'description_ar' => $descriptionAr,
            ]);

            // Update user's total points
            $user->increment('points', $points);

            // Check for community badge eligibility
            $this->checkCommunityBadgeEligibility($user);

            DB::commit();

            // Fire PointsAwarded event for proper integration
            event(new \App\Events\PointsAwarded($user->fresh(), $point, $user->points));

            $this->forgetCacheTags([
                "user_points_{$userId}",
                "user_{$userId}",
                "leaderboard",
            ]);

            return $point;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Failed to award points', [
                'user_id' => $userId,
                'points' => $points,
                'source' => $source,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Award points for challenge participation
     */
    public function awardChallengePoints(
        int $userId,
        int $challengeId,
        int $points,
        ?string $reason = null
    ): Point {
        $challenge = Challenge::findOrFail($challengeId);

        return $this->awardPoints(
            $userId,
            $points,
            'challenge',
            $challengeId,
            $reason ?? "Points from challenge: {$challenge->title}",
            $reason ?? "نقاط من تحدّي: {$challenge->title}"
        );
    }

    /**
     * Award points for challenge completion
     */
    public function awardChallengeCompletionPoints(
        ChallengeParticipation $participation,
        int $basePoints,
        ?int $bonusPoints = null
    ): void {
        $totalPoints = $basePoints + ($bonusPoints ?? 0);

        // Update participation record
        $participation->update([
            'points_earned' => $totalPoints,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Award points
        $this->awardChallengePoints(
            $participation->user_id,
            $participation->challenge_id,
            $totalPoints,
            "Completed challenge: {$participation->challenge->title}"
        );
    }

    /**
     * Award points for ranking in challenge
     */
    public function awardRankingPoints(
        int $userId,
        int $challengeId,
        int $rank,
        int $basePoints
    ): void {
        // Award bonus points based on rank
        $bonusMultiplier = match($rank) {
            1 => 1.5,  // 50% bonus for 1st place
            2 => 1.3,  // 30% bonus for 2nd place
            3 => 1.2,  // 20% bonus for 3rd place
            default => 1.0,
        };

        $totalPoints = (int) round($basePoints * $bonusMultiplier);

        $this->awardChallengePoints(
            $userId,
            $challengeId,
            $totalPoints,
            "Ranked #{$rank} in challenge"
        );
    }

    /**
     * Check if user is eligible for community badges based on points
     */
    private function checkCommunityBadgeEligibility(User $user): void
    {
        $badgeService = app(BadgeService::class);
        $badgeService->checkAndAwardCommunityBadges($user);
    }

    /**
     * Get user's total points
     */
    public function getUserTotalPoints(int $userId): int
    {
        $cacheKey = "user_total_points_{$userId}";

        return $this->cache($cacheKey, function () use ($userId) {
            return User::findOrFail($userId)->points ?? 0;
        }, 300); // Cache for 5 minutes
    }

    /**
     * Get user's points history
     */
    public function getUserPointsHistory(int $userId, int $perPage = 20)
    {
        $cacheKey = "user_points_history_{$userId}_{$perPage}";
        $cacheTag = "user_points_{$userId}";

        return $this->cacheTags($cacheTag, $cacheKey, function () use ($userId, $perPage) {
            return Point::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);
        }, 300);
    }

    /**
     * Get points by source
     */
    public function getPointsBySource(int $userId, string $source, ?int $sourceId = null): int
    {
        $query = Point::where('user_id', $userId)
            ->where('source', $source)
            ->where('type', 'earned');

        if ($sourceId) {
            $query->where('source_id', $sourceId);
        }

        return $query->sum('points');
    }
}
