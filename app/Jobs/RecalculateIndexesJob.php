<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ScoringEngine\ScoringEngineService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Background job to recalculate all indexes for a user.
 */
class RecalculateIndexesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(
        private User $user,
    ) {}

    public function handle(ScoringEngineService $scoringEngine): void
    {
        Log::info("Recalculating indexes for user #{$this->user->id}");

        try {
            $index = $scoringEngine->recalculateForUser($this->user);
            Log::info("Recalculation complete for user #{$this->user->id}: overall={$index->overall_score}, classification={$index->classification}");
        } finally {
            Cache::forget("recalculating_user_{$this->user->id}");
            // Recommendations are keyed off the index scores computed above and
            // cached 24h (Innovation/AdminInnovation controllers) — stale after recalc.
            Cache::forget("recommendations_user_{$this->user->id}");
        }
    }
}
