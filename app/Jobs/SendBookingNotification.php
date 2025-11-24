<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Mail\NewBookingNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendBookingNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        private Booking $booking,
        private array $recipients = []
    ) {}

    public function handle(): void
    {
        try {
            $mailable = new NewBookingNotification($this->booking);

            // Send to teacher
            if ($this->booking->teacher && $this->booking->teacher->user && $this->booking->teacher->user->email) {
                Mail::to($this->booking->teacher->user->email)->send($mailable);
            }

            // Send to admin
            $admin = \App\Models\User::where('role', 'admin')->first();
            if ($admin && $admin->email) {
                Mail::to($admin->email)->send($mailable);
            }

            // Send to additional recipients
            foreach ($this->recipients as $email) {
                if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    Mail::to($email)->send($mailable);
                }
            }
        } catch (\Exception $e) {
            Log::error('Failed to send booking notification', [
                'booking_id' => $this->booking->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error('Booking notification job failed', [
            'booking_id' => $this->booking->id,
            'error' => $exception->getMessage(),
        ]);
    }
}

