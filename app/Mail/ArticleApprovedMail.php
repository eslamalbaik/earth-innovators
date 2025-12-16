<?php

namespace App\Mail;

use App\Models\Publication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ArticleApprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Publication $publication;

    public function __construct(Publication $publication)
    {
        $this->publication = $publication;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '✍️ تمت الموافقة على نشر مقالك',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.article-approved',
            with: [
                'publication' => $this->publication,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
