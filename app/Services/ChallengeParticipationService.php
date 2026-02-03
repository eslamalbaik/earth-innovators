<?php

namespace App\Services;

use App\Models\Challenge;
use App\Models\ChallengeParticipation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChallengeParticipationService extends BaseService
{
    /**
     * Join a challenge
     */
    public function joinChallenge(int $userId, int $challengeId): ChallengeParticipation
    {
        Log::info('User joining challenge', [
            'user_id' => $userId,
            'challenge_id' => $challengeId
        ]);

        DB::beginTransaction();
        try {
            $challenge = Challenge::findOrFail($challengeId);
            $user = User::findOrFail($userId);

            // Validate user can join
            $this->validateJoinRequest($user, $challenge);

            // Check if already participating
            $existing = ChallengeParticipation::where('challenge_id', $challengeId)
                ->where('user_id', $userId)
                ->first();

            if ($existing) {
                throw new \Exception('You are already participating in this challenge');
            }

            // Create participation
            $participation = ChallengeParticipation::create([
                'challenge_id' => $challengeId,
                'user_id' => $userId,
                'status' => 'joined',
                'participation_type' => 'optional', // Default to optional when student joins voluntarily
                'points_earned' => 0,
                'joined_at' => now(),
            ]);

            // Update challenge participant count
            $challenge->increment('current_participants');

            DB::commit();

            $this->forgetCacheTags([
                "challenge_{$challengeId}",
                "user_challenges_{$userId}",
                "active_challenges",
            ]);

            return $participation->fresh(['challenge', 'user']);
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Failed to join challenge', [
                'user_id' => $userId,
                'challenge_id' => $challengeId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Leave a challenge (abandon participation)
     */
    public function leaveChallenge(int $userId, int $challengeId): bool
    {
        Log::info('User leaving challenge', [
            'user_id' => $userId,
            'challenge_id' => $challengeId
        ]);

        DB::beginTransaction();
        try {
            $participation = ChallengeParticipation::where('challenge_id', $challengeId)
                ->where('user_id', $userId)
                ->first();

            if (!$participation) {
                throw new \Exception('You are not participating in this challenge');
            }

            // Don't allow leaving if already completed
            if ($participation->status === 'completed') {
                throw new \Exception('Cannot leave a completed challenge');
            }

            // Update status to abandoned
            $participation->update(['status' => 'abandoned']);

            // Decrement participant count
            $challenge = Challenge::findOrFail($challengeId);
            $challenge->decrement('current_participants');

            DB::commit();

            $this->forgetCacheTags([
                "challenge_{$challengeId}",
                "user_challenges_{$userId}",
                "active_challenges",
            ]);

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Failed to leave challenge', [
                'user_id' => $userId,
                'challenge_id' => $challengeId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Validate if user can join challenge
     */
    private function validateJoinRequest(User $user, Challenge $challenge): void
    {
        // Only students can join
        if (!$user->isStudent()) {
            throw new \Exception('Only students can join challenges');
        }

        // Check if challenge is active
        if (!$challenge->isActive()) {
            throw new \Exception('This challenge is not currently active');
        }

        // Check max participants
        if ($challenge->max_participants && $challenge->current_participants >= $challenge->max_participants) {
            throw new \Exception('This challenge has reached maximum participants');
        }
    }

    /**
     * Update participation status
     */
    public function updateParticipationStatus(
        int $participationId,
        string $status,
        ?int $pointsEarned = null
    ): ChallengeParticipation {
        DB::beginTransaction();
        try {
            $participation = ChallengeParticipation::findOrFail($participationId);

            $updateData = ['status' => $status];

            if ($status === 'completed') {
                $updateData['completed_at'] = now();
                if ($pointsEarned !== null) {
                    $updateData['points_earned'] = $pointsEarned;
                }
            }

            $participation->update($updateData);

            DB::commit();

            $this->forgetCacheTags([
                "challenge_{$participation->challenge_id}",
                "user_challenges_{$participation->user_id}",
                "leaderboard",
            ]);

            return $participation->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->logError('Failed to update participation status', [
                'participation_id' => $participationId,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get user's participation in a challenge
     */
    public function getUserParticipation(int $userId, int $challengeId): ?ChallengeParticipation
    {
        return ChallengeParticipation::where('challenge_id', $challengeId)
            ->where('user_id', $userId)
            ->with(['challenge', 'user'])
            ->first();
    }

    /**
     * Get all participations for a challenge
     */
    public function getChallengeParticipations(int $challengeId, ?string $status = null)
    {
        $query = ChallengeParticipation::where('challenge_id', $challengeId)
            ->with(['user:id,name,points', 'user.school:id,name'])
            ->orderBy('points_earned', 'desc')
            ->orderBy('completed_at', 'asc');

        if ($status) {
            $query->where('status', $status);
        }

        return $query->get();
    }

    /**
     * Get user's active participations
     */
    public function getUserActiveParticipations(int $userId)
    {
        return ChallengeParticipation::where('user_id', $userId)
            ->whereIn('status', ['joined', 'in_progress'])
            ->with(['challenge'])
            ->orderBy('joined_at', 'desc')
            ->get();
    }

    /**
     * Get user's completed participations
     */
    public function getUserCompletedParticipations(int $userId, int $limit = 10)
    {
        return ChallengeParticipation::where('user_id', $userId)
            ->where('status', 'completed')
            ->with(['challenge'])
            ->orderBy('completed_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
