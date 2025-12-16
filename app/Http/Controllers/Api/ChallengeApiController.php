<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ChallengeService;
use App\Models\Challenge;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ChallengeApiController extends Controller
{
    public function __construct(
        private ChallengeService $challengeService
    ) {}

    /**
     * Get all active challenges (public)
     */
    public function index(Request $request): JsonResponse
    {
        $challenges = $this->challengeService->getActiveChallenges(
            $request->get('search'),
            $request->get('category'),
            $request->get('challenge_type'),
            $request->get('school_id'),
            $request->get('per_page', 12)
        );

        return response()->json([
            'success' => true,
            'data' => [
                'challenges' => $challenges->items(),
                'pagination' => [
                    'current_page' => $challenges->currentPage(),
                    'last_page' => $challenges->lastPage(),
                    'per_page' => $challenges->perPage(),
                    'total' => $challenges->total(),
                ],
            ],
        ]);
    }

    /**
     * Get challenge details
     */
    public function show(int $challengeId): JsonResponse
    {
        $challenge = Challenge::with(['creator:id,name', 'school:id,name', 'participants'])
            ->findOrFail($challengeId);

        return response()->json([
            'success' => true,
            'data' => [
                'challenge' => [
                    'id' => $challenge->id,
                    'title' => $challenge->title,
                    'objective' => $challenge->objective,
                    'description' => $challenge->description,
                    'image' => $challenge->image_url,
                    'instructions' => $challenge->instructions,
                    'category' => $challenge->category,
                    'challenge_type' => $challenge->challenge_type,
                    'age_group' => $challenge->age_group,
                    'start_date' => $challenge->start_date,
                    'deadline' => $challenge->deadline,
                    'status' => $challenge->status,
                    'points_reward' => $challenge->points_reward,
                    'max_participants' => $challenge->max_participants,
                    'current_participants' => $challenge->current_participants,
                    'remaining_days' => $challenge->remaining_days,
                    'progress_percentage' => $challenge->progress_percentage,
                    'creator' => $challenge->creator ? [
                        'id' => $challenge->creator->id,
                        'name' => $challenge->creator->name,
                    ] : null,
                    'school' => $challenge->school ? [
                        'id' => $challenge->school->id,
                        'name' => $challenge->school->name,
                    ] : null,
                ],
            ],
        ]);
    }
}

