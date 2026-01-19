<?php

namespace App\Services;

use App\Models\ChallengeEvaluation;
use App\Models\ChallengeSubmission;
use App\Models\Challenge;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EvaluationService extends BaseService
{
    /**
     * Create a new evaluation for a submission
     */
    public function createEvaluation(array $data): ChallengeEvaluation
    {
        DB::beginTransaction();
        try {
            $submission = ChallengeSubmission::with(['challenge', 'student'])->findOrFail($data['submission_id']);
            
            // Validate evaluator permissions
            $this->validateEvaluatorPermissions($data['evaluator_id'], $submission->challenge);

            $evaluation = ChallengeEvaluation::create([
                'submission_id' => $data['submission_id'],
                'evaluator_id' => $data['evaluator_id'],
                'role' => $data['role'] ?? 'teacher',
                'score' => $data['score'] ?? null,
                'feedback' => $data['feedback'] ?? null,
                'visibility' => $data['visibility'] ?? 'student-visible',
                'evaluated_at' => now(),
            ]);

            // Update submission reviewed_at if first evaluation
            if (!$submission->reviewed_at) {
                $submission->update(['reviewed_at' => now()]);
            }

            // Award points if score is provided and submission is approved
            if ($evaluation->score !== null && $submission->challenge->points_reward > 0) {
                $this->awardPoints($submission, $evaluation->score);
            }

            DB::commit();
            
            // Trigger event for notification
            event(new \App\Events\EvaluationCreated($evaluation, $submission));
            
            return $evaluation->fresh(['evaluator', 'submission']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create evaluation: ' . $e->getMessage(), [
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Update an existing evaluation
     */
    public function updateEvaluation(ChallengeEvaluation $evaluation, array $data): ChallengeEvaluation
    {
        DB::beginTransaction();
        try {
            $submission = $evaluation->submission;
            $oldScore = $evaluation->score;
            
            $evaluation->update($data);

            // Update points if score changed
            if (isset($data['score']) && $data['score'] !== $oldScore && $submission->challenge->points_reward > 0) {
                $this->updatePoints($submission, $data['score'], $oldScore);
            }

            DB::commit();
            
            // Trigger event for notification
            event(new \App\Events\EvaluationUpdated($evaluation, $submission));
            
            return $evaluation->fresh(['evaluator', 'submission']);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update evaluation: ' . $e->getMessage(), [
                'evaluation_id' => $evaluation->id,
                'data' => $data,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Delete an evaluation
     */
    public function deleteEvaluation(ChallengeEvaluation $evaluation): bool
    {
        DB::beginTransaction();
        try {
            $submission = $evaluation->submission;
            $evaluationId = $evaluation->id;
            
            $evaluation->delete();

            DB::commit();
            
            // Trigger event for notification
            event(new \App\Events\EvaluationDeleted($evaluationId, $submission));
            
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete evaluation: ' . $e->getMessage(), [
                'evaluation_id' => $evaluation->id,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Validate that evaluator has permission to evaluate this submission
     */
    private function validateEvaluatorPermissions(int $evaluatorId, Challenge $challenge): void
    {
        $evaluator = User::findOrFail($evaluatorId);
        
        // Check if evaluator is the challenge owner, school admin, or system admin
        $isOwner = $challenge->created_by === $evaluatorId;
        $isSchoolAdmin = $challenge->school_id && $evaluator->school_id === $challenge->school_id && $evaluator->role === 'school';
        $isSystemAdmin = $evaluator->role === 'admin';
        $isTeacher = $evaluator->role === 'teacher' && $evaluator->school_id === $challenge->school_id;

        if (!$isOwner && !$isSchoolAdmin && !$isSystemAdmin && !$isTeacher) {
            throw new \Exception('ليس لديك صلاحية لتقييم هذا التسليم');
        }
    }

    /**
     * Award points to student based on evaluation score
     */
    private function awardPoints(ChallengeSubmission $submission, ?float $score): void
    {
        if ($score === null) {
            return;
        }

        $challenge = $submission->challenge;
        $pointsToAward = (int) round(($score / 100) * $challenge->points_reward);

        if ($pointsToAward > 0) {
            // Use PointsService for proper integration
            $pointsService = app(\App\Services\PointsService::class);
            
            // Update submission points
            $submission->update(['points_earned' => $pointsToAward]);

            // Award points using PointsService
            $pointsService->awardChallengePoints(
                $submission->student_id,
                $challenge->id,
                $pointsToAward,
                "تقييم تحدّي: {$challenge->title} (النتيجة: {$score}%)"
            );
        }
    }

    /**
     * Update points when evaluation score changes
     */
    private function updatePoints(ChallengeSubmission $submission, ?float $newScore, ?float $oldScore): void
    {
        if ($newScore === null && $oldScore === null) {
            return;
        }

        $challenge = $submission->challenge;
        
        $oldPoints = $oldScore ? (int) round(($oldScore / 100) * $challenge->points_reward) : 0;
        $newPoints = $newScore ? (int) round(($newScore / 100) * $challenge->points_reward) : 0;
        $pointsDiff = $newPoints - $oldPoints;

        if ($pointsDiff !== 0) {
            // Update submission points
            $submission->update(['points_earned' => $newPoints]);

            // Update student points using PointsService
            $pointsService = app(\App\Services\PointsService::class);
            
            if ($pointsDiff > 0) {
                // Award additional points
                $pointsService->awardChallengePoints(
                    $submission->student_id,
                    $challenge->id,
                    $pointsDiff,
                    "تحديث نقاط من تقييم تحدّي: {$challenge->title}"
                );
            } else {
                // Deduct points (should be rare, but handle it)
                // Note: PointsService doesn't have a deduct method, so we'll handle it manually
                // but this should be logged and reviewed
                $submission->student->decrement('points', abs($pointsDiff));
                
                // Log the deduction for audit purposes
                \Illuminate\Support\Facades\Log::warning('Points deducted from user', [
                    'user_id' => $submission->student_id,
                    'points_deducted' => abs($pointsDiff),
                    'challenge_id' => $challenge->id,
                    'reason' => 'Score decreased in evaluation update'
                ]);
            }
        }
    }

    /**
     * Get evaluations for a submission
     */
    public function getSubmissionEvaluations(int $submissionId, ?int $userId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = ChallengeEvaluation::where('submission_id', $submissionId)
            ->with(['evaluator:id,name,email']);

        // Filter by visibility if user is provided
        if ($userId) {
            $user = User::find($userId);
            if ($user && $user->isStudent()) {
                // Students can only see student-visible evaluations
                $query->where('visibility', 'student-visible');
            } elseif ($user && ($user->isTeacher() || $user->isSchool())) {
                // Teachers and schools can see student-visible and teacher-only
                $query->whereIn('visibility', ['student-visible', 'teacher-only']);
            }
            // Admins can see all
        }

        return $query->orderBy('evaluated_at', 'desc')->get();
    }
}

