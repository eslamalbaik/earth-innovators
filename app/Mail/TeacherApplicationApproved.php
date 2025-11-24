<?php

namespace App\Mail;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TeacherApplicationApproved extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $teacher;

    public function __construct(Teacher $teacher)
    {
        $this->teacher = $teacher;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم قبول طلب الانضمام - مرحباً بك في منصة معلمك',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.teacher-application-approved',
            with: [
                'teacher' => $this->teacher,
                'loginUrl' => url('/login'),
                'dashboardUrl' => url('/teacher/dashboard'),
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
