<?php

namespace App\Listeners;

use App\Events\ChallengeCreated;
use App\Notifications\ChallengeCreatedNotification;
use App\Services\NotificationLoggerService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendChallengeCreatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Handle the event.
     */
    public function handle(ChallengeCreated $event): void
    {
        try {
            NotificationLoggerService::logEventFired('ChallengeCreated', [
                'challenge_id' => $event->challenge->id,
                'school_id' => $event->challenge->school_id,
            ]);

            $challenge = $event->challenge->fresh(['creator', 'school']);
            
            // إرسال إشعار للمدرسة التي ينتمي إليها التحدي
            if ($challenge->school_id) {
                $school = \App\Models\User::find($challenge->school_id);
                
                if ($school && $school->role === 'school') {
                    // إرسال إشعار للمدرسة
                    $schoolNotification = new \App\Notifications\ChallengeCreatedNotification($challenge);
                    $school->notify($schoolNotification);
                    
                    NotificationLoggerService::logNotificationCreated(
                        'ChallengeCreatedNotification',
                        $school->id,
                        [
                            'challenge_id' => $challenge->id,
                            'challenge_title' => $challenge->title,
                            'status' => $challenge->status,
                        ]
                    );

                    NotificationLoggerService::logNotificationBroadcast(
                        'ChallengeCreatedNotification',
                        $school->id,
                        'App.Models.User.' . $school->id
                    );
                    
                    Log::info('✅ Challenge created notification sent to school', [
                        'challenge_id' => $challenge->id,
                        'school_id' => $school->id,
                        'school_email' => $school->email,
                        'challenge_title' => $challenge->title,
                        'status' => $challenge->status,
                    ]);
                } else {
                    NotificationLoggerService::logNotificationError('School not found or invalid role', [
                        'challenge_id' => $challenge->id,
                        'school_id' => $challenge->school_id,
                        'school' => $school ? $school->role : 'not found',
                    ]);

                    Log::warning('❌ School not found or invalid role for challenge notification', [
                        'challenge_id' => $challenge->id,
                        'school_id' => $challenge->school_id,
                        'school' => $school ? $school->role : 'not found',
                    ]);
                }

                // إرسال إشعار لجميع الطلاب في المدرسة (فقط إذا كان التحدي نشط)
                if ($challenge->status === 'active') {
                    $students = \App\Models\User::where('school_id', $challenge->school_id)
                        ->where('role', 'student')
                        ->get();

                    Log::info('📬 Sending challenge notifications to students', [
                        'challenge_id' => $challenge->id,
                        'school_id' => $challenge->school_id,
                        'students_count' => $students->count(),
                    ]);

                    $successCount = 0;
                    $failCount = 0;

                    foreach ($students as $student) {
                        try {
                            $studentNotification = new \App\Notifications\NewChallengeNotification($challenge);
                            $student->notify($studentNotification);

                            NotificationLoggerService::logNotificationCreated(
                                'NewChallengeNotification',
                                $student->id,
                                [
                                    'challenge_id' => $challenge->id,
                                    'challenge_title' => $challenge->title,
                                    'student_email' => $student->email,
                                ]
                            );

                            NotificationLoggerService::logNotificationBroadcast(
                                'NewChallengeNotification',
                                $student->id,
                                'App.Models.User.' . $student->id
                            );

                            $successCount++;
                            Log::debug('✅ Challenge notification sent to student', [
                                'student_id' => $student->id,
                                'student_email' => $student->email,
                                'challenge_id' => $challenge->id,
                            ]);
                        } catch (\Exception $e) {
                            $failCount++;
                            NotificationLoggerService::logNotificationError($e->getMessage(), [
                                'student_id' => $student->id,
                                'challenge_id' => $challenge->id,
                            ]);

                            Log::error('❌ Failed to send challenge notification to student', [
                                'student_id' => $student->id,
                                'student_email' => $student->email,
                                'challenge_id' => $challenge->id,
                                'error' => $e->getMessage(),
                            ]);
                        }
                    }

                    Log::info('✅ Challenge notifications to students completed', [
                        'challenge_id' => $challenge->id,
                        'total_students' => $students->count(),
                        'success_count' => $successCount,
                        'fail_count' => $failCount,
                    ]);
                } else {
                    Log::info('⏭️ Challenge is not active, skipping student notifications', [
                        'challenge_id' => $challenge->id,
                        'status' => $challenge->status,
                    ]);
                }
            } else {
                NotificationLoggerService::logNotificationError('Challenge has no school_id', [
                    'challenge_id' => $challenge->id,
                ]);

                Log::warning('❌ Challenge has no school_id, skipping notification', [
                    'challenge_id' => $challenge->id,
                ]);
            }

            NotificationLoggerService::logListenerExecuted(
                'SendChallengeCreatedNotification',
                'ChallengeCreated',
                true
            );
        } catch (\Exception $e) {
            NotificationLoggerService::logListenerExecuted(
                'SendChallengeCreatedNotification',
                'ChallengeCreated',
                false
            );

            NotificationLoggerService::logNotificationError($e->getMessage(), [
                'challenge_id' => $event->challenge->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            Log::error('❌ Failed to send challenge created notification: ' . $e->getMessage(), [
                'challenge_id' => $event->challenge->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}

