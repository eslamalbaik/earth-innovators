<?php

namespace App\Jobs;

use App\Models\Achievement;
use App\Services\AIEngine\AchievementValidator;
use App\Services\AIEngine\ContentAnalyzer;
use App\Services\AIEngine\EntityExtractor;
use App\Services\ScoringEngine\ScoringEngineService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Background job that runs after an achievement is created/updated.
 * 
 * 1. Validates the achievement with AI
 * 2. Scores evidence quality
 * 3. Analyzes content
 * 4. Extracts entities (skills, tech, etc.)
 * 5. Recalculates user indexes
 */
class AnalyzeAchievementJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(
        private Achievement $achievement,
    ) {}

    public function handle(
        AchievementValidator $validator,
        ContentAnalyzer $contentAnalyzer,
        EntityExtractor $entityExtractor,
        ScoringEngineService $scoringEngine,
    ): void {
        $achievement = $this->achievement->fresh(['attachments', 'user']);
        $user = $achievement->user;

        Log::info("Analyzing achievement #{$achievement->id} for user #{$user->id}");

        try {
            // Step 1: Validate achievement
            $validationResult = $validator->validateAchievement($achievement);
            Log::info("Achievement #{$achievement->id} validation: {$validationResult['validation_status']}");

            // Step 2: Score evidence for all attachments
            $evidenceScore = $validator->scoreAllEvidence($achievement);
            Log::info("Achievement #{$achievement->id} evidence score: {$evidenceScore}");

            // Step 3: Analyze content (if description exists)
            if ($achievement->description) {
                $contentAnalysis = $contentAnalyzer->analyze(
                    $achievement->description,
                    $achievement->type
                );
                Log::info("Achievement #{$achievement->id} content analyzed");
            }

            // Step 4: Extract entities and sync to user profile
            $textContent = $achievement->title . ' ' . ($achievement->description ?? '');
            $extraction = $entityExtractor->extractAndSync($user, $textContent, $achievement->id);
            Log::info("Achievement #{$achievement->id}: synced {$extraction['total_synced']} skills");

            // Step 5: Recalculate all indexes
            $scoringEngine->recalculateForUser($user);
            Log::info("Recalculated indexes for user #{$user->id}");

        } catch (\Throwable $e) {
            Log::error("Error analyzing achievement #{$achievement->id}: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);

            // Mark as pending if analysis fails (will retry)
            $achievement->update(['ai_validation_status' => 'pending']);

            throw $e;
        }
    }
}
