<?php

namespace App\Observers;

use App\Models\Booking;
use App\Services\ChatService;

class BookingObserver
{
    public function created(Booking $booking): void {}

    public function updated(Booking $booking): void {}
}

