<?php

namespace App\Jobs;

use App\Models\Publication;
use App\Models\User;
use App\Notifications\NewPublicationNotification;
use App\Services\NotificationLoggerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendNewPublicationNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    public function __construct(
        private Publication $publication
    ) {}

    public function handle(): void
    {
        try {
            NotificationLoggerService::logEventFired('PublicationPublished', [
                'publication_id' => $this->publication->id,
                'school_id' => $this->publication->school_id,
            ]);

            $this->publication->refresh();
            $this->publication->load(['author', 'school']);

            // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة
            if ($this->publication->school_id) {
                $users = User::where('school_id', $this->publication->school_id)
                    ->whereIn('role', ['student', 'teacher'])
                    ->get();

                Log::info('📬 Sending publication notifications', [
                    'publication_id' => $this->publication->id,
                    'publication_title' => $this->publication->title,
                    'school_id' => $this->publication->school_id,
                    'users_count' => $users->count(),
                ]);

                $successCount = 0;
                $failCount = 0;

                foreach ($users as $user) {
                    try {
                        $notification = new NewPublicationNotification($this->publication);
                        $user->notify($notification);

                        NotificationLoggerService::logNotificationCreated(
                            'NewPublicationNotification',
                            $user->id,
                            [
                                'publication_id' => $this->publication->id,
                                'publication_title' => $this->publication->title,
                                'user_role' => $user->role,
                            ]
                        );

                        NotificationLoggerService::logNotificationBroadcast(
                            'NewPublicationNotification',
                            $user->id,
                            'App.Models.User.' . $user->id
                        );

                        $successCount++;
                        Log::debug('✅ Publication notification sent', [
                            'user_id' => $user->id,
                            'user_email' => $user->email,
                            'user_role' => $user->role,
                            'publication_id' => $this->publication->id,
                        ]);
                    } catch (\Exception $e) {
                        $failCount++;
                        NotificationLoggerService::logNotificationError($e->getMessage(), [
                            'user_id' => $user->id,
                            'publication_id' => $this->publication->id,
                        ]);

                        Log::error('❌ Failed to send publication notification to user', [
                            'user_id' => $user->id,
                            'user_email' => $user->email,
                            'publication_id' => $this->publication->id,
                            'error' => $e->getMessage(),
                        ]);
                    }
                }

                Log::info('✅ Publication notifications completed', [
                    'publication_id' => $this->publication->id,
                    'total_users' => $users->count(),
                    'success_count' => $successCount,
                    'fail_count' => $failCount,
                ]);
            } else {
                NotificationLoggerService::logNotificationError('Publication has no school_id', [
                    'publication_id' => $this->publication->id,
                ]);

                Log::warning('❌ Publication has no school_id, skipping notifications', [
                    'publication_id' => $this->publication->id,
                ]);
            }
        } catch (\Exception $e) {
            NotificationLoggerService::logNotificationError($e->getMessage(), [
                'publication_id' => $this->publication->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            Log::error('❌ Failed to send new publication notification: ' . $e->getMessage(), [
                'publication_id' => $this->publication->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}

