<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChallengeParticipationService;
use App\Services\PointsService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ChallengeParticipationApiController extends Controller
{
    public function __construct(
        private ChallengeParticipationService $participationService,
        private PointsService $pointsService
    ) {}

    /**
     * Join a challenge
     */
    public function join(Request $request, int $challengeId): JsonResponse
    {
        $request->validate([
            'challenge_id' => 'required|exists:challenges,id',
        ]);

        try {
            $user = Auth::user();

            if (!$user || !$user->isStudent()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only students can join challenges',
                ], 403);
            }

            $participation = $this->participationService->joinChallenge($user->id, $challengeId);

            return response()->json([
                'success' => true,
                'message' => 'Successfully joined challenge',
                'data' => [
                    'participation' => [
                        'id' => $participation->id,
                        'challenge_id' => $participation->challenge_id,
                        'status' => $participation->status,
                        'joined_at' => $participation->joined_at,
                    ],
                ],
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get user's participation in a challenge
     */
    public function show(int $challengeId): JsonResponse
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $participation = $this->participationService->getUserParticipation($user->id, $challengeId);

        if (!$participation) {
            return response()->json([
                'success' => false,
                'message' => 'Not participating in this challenge',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'participation' => [
                    'id' => $participation->id,
                    'challenge_id' => $participation->challenge_id,
                    'status' => $participation->status,
                    'points_earned' => $participation->points_earned,
                    'rank' => $participation->rank,
                    'joined_at' => $participation->joined_at,
                    'completed_at' => $participation->completed_at,
                ],
            ],
        ]);
    }

    /**
     * Get user's active participations
     */
    public function active(): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $participations = $this->participationService->getUserActiveParticipations($user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'participations' => $participations->map(function ($participation) {
                    return [
                        'id' => $participation->id,
                        'challenge' => [
                            'id' => $participation->challenge->id,
                            'title' => $participation->challenge->title,
                            'deadline' => $participation->challenge->deadline,
                            'points_reward' => $participation->challenge->points_reward,
                        ],
                        'status' => $participation->status,
                        'joined_at' => $participation->joined_at,
                    ];
                }),
            ],
        ]);
    }

    /**
     * Get user's completed participations
     */
    public function completed(): JsonResponse
    {
        $user = Auth::user();

        if (!$user || !$user->isStudent()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $participations = $this->participationService->getUserCompletedParticipations($user->id);

        return response()->json([
            'success' => true,
            'data' => [
                'participations' => $participations->map(function ($participation) {
                    return [
                        'id' => $participation->id,
                        'challenge' => [
                            'id' => $participation->challenge->id,
                            'title' => $participation->challenge->title,
                        ],
                        'points_earned' => $participation->points_earned,
                        'rank' => $participation->rank,
                        'completed_at' => $participation->completed_at,
                    ];
                }),
            ],
        ]);
    }
}
