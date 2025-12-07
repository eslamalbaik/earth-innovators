<?php

namespace App\Services;

use App\Models\ChallengeSubmission;
use App\Models\ChallengeEvaluation;
use App\Models\ChallengeSubmissionComment;
use App\Models\User;
use App\Models\NotificationPreference;
use App\Notifications\ChallengeSubmissionCreatedNotification;
use App\Notifications\ChallengeEvaluationCreatedNotification;
use App\Notifications\ChallengeEvaluationUpdatedNotification;
use App\Notifications\ChallengeCommentAddedNotification;
use App\Notifications\ChallengeStatusChangedNotification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ChallengeNotificationRouterService extends BaseService
{
    /**
     * Deduplication window in seconds
     */
    private const DEDUPLICATION_WINDOW = 5;

    /**
     * Route notification for submission_created event
     */
    public function routeSubmissionCreated(ChallengeSubmission $submission, int $initiatorId): void
    {
        try {
            $challenge = $submission->challenge;
            $recipients = $this->getSubmissionCreatedRecipients($challenge);
            
            foreach ($recipients as $recipient) {
                if ($this->shouldSendNotification($recipient->id, 'submission_created', $submission->id)) {
                    $this->sendNotification(
                        $recipient,
                        new ChallengeSubmissionCreatedNotification($submission),
                        'submission_created',
                        $submission->id
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to route submission_created notification: ' . $e->getMessage(), [
                'submission_id' => $submission->id,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Route notification for evaluation_created event
     */
    public function routeEvaluationCreated(ChallengeEvaluation $evaluation, ChallengeSubmission $submission): void
    {
        try {
            // Only send to student if evaluation is visible to them
            if ($evaluation->isVisibleToStudent()) {
                $student = $submission->student;
                if ($this->shouldSendNotification($student->id, 'evaluation_created', $evaluation->id)) {
                    $this->sendNotification(
                        $student,
                        new ChallengeEvaluationCreatedNotification($evaluation, $submission),
                        'evaluation_created',
                        $evaluation->id
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to route evaluation_created notification: ' . $e->getMessage(), [
                'evaluation_id' => $evaluation->id,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Route notification for evaluation_updated event
     */
    public function routeEvaluationUpdated(ChallengeEvaluation $evaluation, ChallengeSubmission $submission): void
    {
        try {
            $recipients = $this->getEvaluationUpdatedRecipients($submission);
            
            foreach ($recipients as $recipient) {
                // Check visibility for student
                if ($recipient->id === $submission->student_id && !$evaluation->isVisibleToStudent()) {
                    continue;
                }

                if ($this->shouldSendNotification($recipient->id, 'evaluation_updated', $evaluation->id)) {
                    $this->sendNotification(
                        $recipient,
                        new ChallengeEvaluationUpdatedNotification($evaluation, $submission),
                        'evaluation_updated',
                        $evaluation->id
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to route evaluation_updated notification: ' . $e->getMessage(), [
                'evaluation_id' => $evaluation->id,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Route notification for comment_added event
     */
    public function routeCommentAdded(ChallengeSubmissionComment $comment, ChallengeSubmission $submission): void
    {
        try {
            $recipients = $this->getCommentAddedRecipients($comment, $submission);
            
            foreach ($recipients as $recipient) {
                if ($this->shouldSendNotification($recipient->id, 'comment_added', $comment->id)) {
                    $this->sendNotification(
                        $recipient,
                        new ChallengeCommentAddedNotification($comment, $submission),
                        'comment_added',
                        $comment->id
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to route comment_added notification: ' . $e->getMessage(), [
                'comment_id' => $comment->id,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Route notification for status_changed event
     */
    public function routeStatusChanged(ChallengeSubmission $submission, string $oldStatus, string $newStatus, int $initiatorId): void
    {
        try {
            $recipients = $this->getStatusChangedRecipients($submission);
            
            foreach ($recipients as $recipient) {
                if ($this->shouldSendNotification($recipient->id, 'status_changed', $submission->id)) {
                    $this->sendNotification(
                        $recipient,
                        new ChallengeStatusChangedNotification($submission, $oldStatus, $newStatus),
                        'status_changed',
                        $submission->id
                    );
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to route status_changed notification: ' . $e->getMessage(), [
                'submission_id' => $submission->id,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Get recipients for submission_created event
     */
    private function getSubmissionCreatedRecipients($challenge): \Illuminate\Support\Collection
    {
        $recipients = collect();

        // Add challenge owner teacher
        if ($challenge->created_by) {
            $teacher = User::find($challenge->created_by);
            if ($teacher) {
                $recipients->push($teacher);
            }
        }

        // Add school admins
        if ($challenge->school_id) {
            $schoolAdmins = User::where('id', $challenge->school_id)
                ->orWhere(function ($query) use ($challenge) {
                    $query->where('school_id', $challenge->school_id)
                        ->where('role', 'admin');
                })
                ->get();
            $recipients = $recipients->merge($schoolAdmins);
        }

        return $recipients->unique('id');
    }

    /**
     * Get recipients for evaluation_updated event
     */
    private function getEvaluationUpdatedRecipients(ChallengeSubmission $submission): \Illuminate\Support\Collection
    {
        $recipients = collect();

        // Add student
        $recipients->push($submission->student);

        // Add challenge owner teacher
        $challenge = $submission->challenge;
        if ($challenge->created_by) {
            $teacher = User::find($challenge->created_by);
            if ($teacher) {
                $recipients->push($teacher);
            }
        }

        return $recipients->unique('id');
    }

    /**
     * Get recipients for comment_added event
     */
    private function getCommentAddedRecipients(ChallengeSubmissionComment $comment, ChallengeSubmission $submission): \Illuminate\Support\Collection
    {
        $recipients = collect();

        // Add mentioned users
        if ($comment->mentioned_user_ids) {
            $mentioned = User::whereIn('id', $comment->mentioned_user_ids)->get();
            $recipients = $recipients->merge($mentioned);
        }

        // Add student
        $recipients->push($submission->student);

        // Add challenge owner teacher
        $challenge = $submission->challenge;
        if ($challenge->created_by) {
            $teacher = User::find($challenge->created_by);
            if ($teacher && $teacher->id !== $comment->user_id) {
                $recipients->push($teacher);
            }
        }

        // Remove comment author
        return $recipients->reject(function ($user) use ($comment) {
            return $user->id === $comment->user_id;
        })->unique('id');
    }

    /**
     * Get recipients for status_changed event
     */
    private function getStatusChangedRecipients(ChallengeSubmission $submission): \Illuminate\Support\Collection
    {
        $recipients = collect();

        // Add student
        $recipients->push($submission->student);

        // Add challenge owner teacher
        $challenge = $submission->challenge;
        if ($challenge->created_by) {
            $teacher = User::find($challenge->created_by);
            if ($teacher) {
                $recipients->push($teacher);
            }
        }

        // Add school admins
        if ($challenge->school_id) {
            $schoolAdmins = User::where('id', $challenge->school_id)
                ->orWhere(function ($query) use ($challenge) {
                    $query->where('school_id', $challenge->school_id)
                        ->where('role', 'admin');
                })
                ->get();
            $recipients = $recipients->merge($schoolAdmins);
        }

        return $recipients->unique('id');
    }

    /**
     * Check if notification should be sent (deduplication + opt-out)
     */
    private function shouldSendNotification(int $userId, string $notificationType, int $relatedId): bool
    {
        // Check opt-out preferences
        if (!NotificationPreference::isEnabled($userId, $notificationType)) {
            return false;
        }

        // Check deduplication
        $cacheKey = "notification_sent_{$userId}_{$notificationType}_{$relatedId}";
        if (Cache::has($cacheKey)) {
            return false;
        }

        return true;
    }

    /**
     * Send notification with deduplication tracking
     */
    private function sendNotification(User $recipient, $notification, string $notificationType, int $relatedId): void
    {
        try {
            $recipient->notify($notification);

            // Track for deduplication
            $cacheKey = "notification_sent_{$recipient->id}_{$notificationType}_{$relatedId}";
            Cache::put($cacheKey, true, self::DEDUPLICATION_WINDOW);
        } catch (\Exception $e) {
            Log::error('Failed to send notification: ' . $e->getMessage(), [
                'recipient_id' => $recipient->id,
                'notification_type' => $notificationType,
                'related_id' => $relatedId,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}

