<?php

namespace App\Mail;

use App\Models\Certificate;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CertificateIssuedMail extends Mailable
{
    use Queueable, SerializesModels;

    public Certificate $certificate;
    public User $user;

    public function __construct(Certificate $certificate, User $user)
    {
        $this->certificate = $certificate;
        $this->user = $user;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎓 تم إصدار شهادة جديدة',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.certificate-issued',
            with: [
                'certificate' => $this->certificate,
                'user' => $this->user,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
