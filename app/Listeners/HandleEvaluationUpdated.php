<?php

namespace App\Listeners;

use App\Events\EvaluationUpdated;
use App\Services\ChallengeNotificationRouterService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleEvaluationUpdated implements ShouldQueue
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
    public function handle(EvaluationUpdated $event): void
    {
        $this->router->routeEvaluationUpdated($event->evaluation, $event->submission);
    }
}
