<?php

namespace App\Listeners;

use App\Events\CommentAdded;
use App\Services\ChallengeNotificationRouterService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class HandleCommentAdded implements ShouldQueue
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
    public function handle(CommentAdded $event): void
    {
        $this->router->routeCommentAdded($event->comment, $event->submission);
    }
}
