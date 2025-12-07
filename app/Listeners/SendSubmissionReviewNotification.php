<?php

namespace App\Listeners;

use App\Events\ChallengeSubmissionReviewed;
use App\Notifications\SubmissionReviewedNotification;
use App\Services\NotificationLoggerService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendSubmissionReviewNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(ChallengeSubmissionReviewed $event): void
    {
        try {
            NotificationLoggerService::logEventFired('ChallengeSubmissionReviewed', [
                'submission_id' => $event->submission->id,
                'reviewed_by' => $event->reviewedBy,
            ]);

            $submission = $event->submission->fresh(['challenge', 'student', 'reviewer']);
            
            // Send notification to the student (not the reviewer)
            if ($submission->student) {
                $notification = new SubmissionReviewedNotification($submission);
                $submission->student->notify($notification);
                
                NotificationLoggerService::logNotificationCreated(
                    'SubmissionReviewedNotification',
                    $submission->student_id,
                    [
                        'submission_id' => $submission->id,
                        'challenge_id' => $submission->challenge_id,
                        'status' => $submission->status,
                    ]
                );

                NotificationLoggerService::logNotificationBroadcast(
                    'SubmissionReviewedNotification',
                    $submission->student_id,
                    'App.Models.User.' . $submission->student_id
                );
                
                Log::info('✅ Submission review notification sent to student', [
                    'submission_id' => $submission->id,
                    'student_id' => $submission->student_id,
                    'student_email' => $submission->student->email,
                    'challenge_id' => $submission->challenge_id,
                    'status' => $submission->status,
                ]);
            } else {
                NotificationLoggerService::logNotificationError('Student not found', [
                    'submission_id' => $submission->id,
                    'student_id' => $submission->student_id,
                ]);
                
                Log::warning('❌ Student not found for submission review notification', [
                    'submission_id' => $submission->id,
                    'student_id' => $submission->student_id,
                ]);
            }

            NotificationLoggerService::logListenerExecuted(
                'SendSubmissionReviewNotification',
                'ChallengeSubmissionReviewed',
                true
            );
        } catch (\Exception $e) {
            NotificationLoggerService::logListenerExecuted(
                'SendSubmissionReviewNotification',
                'ChallengeSubmissionReviewed',
                false
            );

            NotificationLoggerService::logNotificationError($e->getMessage(), [
                'submission_id' => $event->submission->id,
                'trace' => $e->getTraceAsString(),
            ]);

            Log::error('❌ Failed to send submission review notification: ' . $e->getMessage(), [
                'submission_id' => $event->submission->id,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}

