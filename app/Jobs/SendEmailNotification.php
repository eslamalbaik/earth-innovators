<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendEmailNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        private string $to,
        private string $mailableClass,
        private array $data = []
    ) {}

    public function handle(): void
    {
        try {
            $mailable = new $this->mailableClass(...$this->data);
            Mail::to($this->to)->send($mailable);
        } catch (\Exception $e) {
            Log::error('Failed to send email notification', [
                'to' => $this->to,
                'mailable' => $this->mailableClass,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Email notification job failed', [
            'to' => $this->to,
            'mailable' => $this->mailableClass,
            'error' => $exception->getMessage(),
        ]);
    }
}

