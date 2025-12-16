<?php

namespace App\Listeners;

use App\Events\ArticleApproved;
use App\Services\EmailService;
use App\Mail\ArticleApprovedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendArticleApprovedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EmailService $emailService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(ArticleApproved $event): void
    {
        $publication = $event->publication;
        $author = $publication->author;

        // Send email to teacher (article author)
        if ($author && $author->role === 'teacher') {
            $this->emailService->send(
                $author->email,
                ArticleApprovedMail::class,
                [$publication],
                true // queue
            );
        }

        // Admin and School receive all events (audit log)
        // You can extend this to notify admins/schools
    }
}
