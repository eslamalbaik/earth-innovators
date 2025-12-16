<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Badge;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BadgeGrantedMail extends Mailable
{
    use Queueable, SerializesModels;

    public User $user;
    public Badge $badge;

    public function __construct(User $user, Badge $badge)
    {
        $this->user = $user;
        $this->badge = $badge;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🏅 حصلت على شارة جديدة',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.badge-granted',
            with: [
                'user' => $this->user,
                'badge' => $this->badge,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
