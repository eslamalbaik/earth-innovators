<?php

namespace App\Listeners;

use App\Events\EvaluationCreated;
use App\Services\ChallengeNotificationRouterService;
use App\Services\NotificationLoggerService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class HandleEvaluationCreated implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(
        private ChallengeNotificationRouterService $router
    ) {}

    /**
     * Handle the event.
     */
    public function handle(EvaluationCreated $event): void
    {
        try {
            NotificationLoggerService::logEventFired('EvaluationCreated', [
                'evaluation_id' => $event->evaluation->id,
                'submission_id' => $event->submission->id,
                'student_id' => $event->submission->student_id,
            ]);

            Log::info('🎯 Handling EvaluationCreated event', [
                'evaluation_id' => $event->evaluation->id,
                'submission_id' => $event->submission->id,
                'student_id' => $event->submission->student_id,
            ]);

            $this->router->routeEvaluationCreated($event->evaluation, $event->submission);

            NotificationLoggerService::logListenerExecuted(
                'HandleEvaluationCreated',
                'EvaluationCreated',
                true
            );
        } catch (\Exception $e) {
            NotificationLoggerService::logListenerExecuted(
                'HandleEvaluationCreated',
                'EvaluationCreated',
                false
            );

            NotificationLoggerService::logNotificationError($e->getMessage(), [
                'evaluation_id' => $event->evaluation->id ?? null,
                'submission_id' => $event->submission->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);

            Log::error('❌ Error handling EvaluationCreated: ' . $e->getMessage(), [
                'evaluation_id' => $event->evaluation->id ?? null,
                'submission_id' => $event->submission->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }
}
