<?php

namespace App\Listeners;

use App\Events\SubmissionCreated;
use App\Services\ChallengeNotificationRouterService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleSubmissionCreated implements ShouldQueue
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
    public function handle(SubmissionCreated $event): void
    {
        $this->router->routeSubmissionCreated($event->submission, $event->initiatorId);
    }
}
