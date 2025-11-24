<?php

namespace App\Mail;

use App\Models\TeacherApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeacherApplicationRejected extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $application;

    public function __construct(TeacherApplication $application)
    {
        $this->application = $application;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تحديث حول طلب الانضمام - منصة معلمك',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.teacher-application-rejected',
            with: [
                'application' => $this->application,
                'teacher' => $this->application->teacher,
                'reapplyUrl' => url('/join-teacher'),
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
