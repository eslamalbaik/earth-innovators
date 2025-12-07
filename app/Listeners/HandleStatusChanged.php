<?php

namespace App\Listeners;

use App\Events\StatusChanged;
use App\Services\ChallengeNotificationRouterService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleStatusChanged implements ShouldQueue
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
    public function handle(StatusChanged $event): void
    {
        $this->router->routeStatusChanged($event->submission, $event->oldStatus, $event->newStatus, $event->initiatorId);
    }
}
