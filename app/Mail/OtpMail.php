<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $code;
    public string $purpose;
    public int $expiryMinutes;

    /**
     * Create a new message instance.
     */
    public function __construct(string $code, string $purpose = 'login', int $expiryMinutes = 10)
    {
        $this->code = $code;
        $this->purpose = $purpose;
        $this->expiryMinutes = $expiryMinutes;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = match($this->purpose) {
            'signup' => '🎯 رمز التحقق للتسجيل',
            'login' => '🔐 رمز التحقق لتسجيل الدخول',
            'password_reset' => '🔒 رمز التحقق لإعادة تعيين كلمة المرور',
            default => '🔑 رمز التحقق'
        };

        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.email-otp',
            with: [
                'code' => $this->code,
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
