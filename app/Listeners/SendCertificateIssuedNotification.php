<?php

namespace App\Listeners;

use App\Events\CertificateIssued;
use App\Services\EmailService;
use App\Mail\CertificateIssuedMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendCertificateIssuedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(
        private EmailService $emailService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(CertificateIssued $event): void
    {
        // Send email notification based on user role
        $user = $event->user;
        $certificate = $event->certificate;

        // Send to student or teacher
        if (in_array($user->role, ['student', 'teacher'])) {
            $this->emailService->send(
                $user->email,
                CertificateIssuedMail::class,
                [$certificate, $user],
                true // queue
            );
        }

        // Admin and School receive all events (can be extended with audit log)
        if (in_array($user->role, ['admin', 'school'])) {
            // For now, also send to admin/school if they are the certificate recipient
            // You can extend this to send to all admins/schools for audit purposes
            $this->emailService->send(
                $user->email,
                CertificateIssuedMail::class,
                [$certificate, $user],
                true // queue
            );
        }
    }
}
