<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $token;
    public string $email;
    public string $name;
    public int $expiryMinutes;

    /**
     * Create a new message instance.
     */
    public function __construct(string $token, string $email, string $name = '', int $expiryMinutes = 15)
    {
        $this->token = $token;
        $this->email = $email;
        $this->name = $name;
        $this->expiryMinutes = $expiryMinutes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🔒 إعادة تعيين كلمة المرور',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $resetUrl = route('password.reset', ['token' => $this->token]);

        return new Content(
            view: 'emails.password-reset',
            with: [
                'name' => $this->name,
                'resetUrl' => $resetUrl,
                'expiryMinutes' => $this->expiryMinutes,
            ]
        );
    }

    /**
     * Get the attachments for the message.
     */
    public function attachments(): array
    {
        return [];
    }
}
