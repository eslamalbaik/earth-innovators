<?php

namespace App\Mail;

use App\Models\ProjectSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProjectEvaluatedMail extends Mailable
{
    use Queueable, SerializesModels;

    public ProjectSubmission $submission;

    public function __construct(ProjectSubmission $submission)
    {
        $this->submission = $submission;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📊 تم تقييم مشروعك',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.project-evaluated',
            with: [
                'submission' => $this->submission,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
