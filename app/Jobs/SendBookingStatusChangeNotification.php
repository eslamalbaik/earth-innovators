<?php

namespace App\Jobs;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Notification;

class SendBookingStatusChangeNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        private Booking $booking
    ) {}

    public function handle(): void
    {
        $student = $this->booking->student;
        
        if ($student) {
            $notification = new \App\Notifications\BookingStatusChanged($this->booking);
            $student->notify($notification);
        }
    }
}

