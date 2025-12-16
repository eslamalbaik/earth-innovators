<?php

namespace App\Listeners;

use App\Events\BadgeGranted;
use App\Services\EmailService;
use App\Mail\BadgeGrantedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendBadgeGrantedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EmailService $emailService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(BadgeGranted $event): void
    {
        $user = $event->user;
        $badge = $event->badge;

        // Send email to student
        if ($user->role === 'student') {
            $this->emailService->send(
                $user->email,
                BadgeGrantedMail::class,
                [$user, $badge],
                true // queue
            );
        }

        // Admin and School receive all events (audit log)
        // You can extend this to notify admins/schools
    }
}
