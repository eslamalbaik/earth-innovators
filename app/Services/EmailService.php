<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class EmailService extends BaseService
{
    protected string $fromEmail;
    protected string $fromName;

    public function __construct()
    {
        $this->fromEmail = env('MAIL_FROM_ADDRESS', 'no-reply@earthinnovators.com');
        $this->fromName = env('MAIL_FROM_NAME', 'Earth Innovators Platform');

        // Configure Gmail SMTP
        $this->configureSmtp();
    }

    /**
     * Configure Gmail SMTP settings
     */
    protected function configureSmtp(): void
    {
        Config::set('mail.default', env('MAIL_MAILER', 'smtp'));
        Config::set('mail.mailers.smtp.host', env('MAIL_HOST', 'smtp.gmail.com'));
        Config::set('mail.mailers.smtp.port', env('MAIL_PORT', 587));
        Config::set('mail.mailers.smtp.encryption', env('MAIL_ENCRYPTION', 'tls'));
        Config::set('mail.mailers.smtp.username', env('MAIL_USERNAME'));
        Config::set('mail.mailers.smtp.password', env('MAIL_PASSWORD'));
        Config::set('mail.from.address', $this->fromEmail);
        Config::set('mail.from.name', $this->fromName);
    }

    /**
     * Send email using a Mailable class
     */
    public function send(string $to, string $mailableClass, array $data = [], bool $queue = true): bool
    {
        try {
            if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                $this->logError('Invalid email address', ['to' => $to]);
                return false;
            }

            if (!class_exists($mailableClass)) {
                $this->logError('Mailable class not found', ['class' => $mailableClass]);
                return false;
            }

            $mailable = new $mailableClass(...$data);

            if ($queue) {
                \App\Jobs\SendEmailNotification::dispatch($to, $mailableClass, $data);

                $this->logInfo('Email queued successfully', [
                    'to' => $to,
                    'mailable' => $mailableClass
                ]);
            } else {
                Mail::to($to)->send($mailable);

                $this->logInfo('Email sent successfully', [
                    'to' => $to,
                    'mailable' => $mailableClass
                ]);
            }

            return true;
        } catch (\Exception $e) {
            $this->logError('Failed to send email', [
                'to' => $to,
                'mailable' => $mailableClass,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Send email to multiple recipients
     */
    public function sendToMany(array $recipients, string $mailableClass, array $data = [], bool $queue = true): array
    {
        $results = [
            'success' => 0,
            'failed' => 0,
            'errors' => []
        ];

        foreach ($recipients as $email) {
            if ($this->send($email, $mailableClass, $data, $queue)) {
                $results['success']++;
            } else {
                $results['failed']++;
                $results['errors'][] = $email;
            }
        }

        return $results;
    }

    /**
     * Validate email configuration
     */
    public function validateConfiguration(): bool
    {
        $required = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD'];

        foreach ($required as $key) {
            if (empty(env($key))) {
                $this->logError('Missing email configuration', ['key' => $key]);
                return false;
            }
        }

        return true;
    }
}
