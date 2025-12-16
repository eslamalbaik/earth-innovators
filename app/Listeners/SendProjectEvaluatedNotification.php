<?php

namespace App\Listeners;

use App\Events\ProjectEvaluated;
use App\Services\EmailService;
use App\Mail\ProjectEvaluatedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendProjectEvaluatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EmailService $emailService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(ProjectEvaluated $event): void
    {
        $submission = $event->submission;
        $student = $submission->student;

        // Send email to student
        if ($student && $student->role === 'student') {
            $this->emailService->send(
                $student->email,
                ProjectEvaluatedMail::class,
                [$submission],
                true // queue
            );
        }

        // Admin and School receive all events (audit log)
        // You can extend this to notify admins/schools
    }
}
