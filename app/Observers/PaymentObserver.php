<?php

namespace App\Observers;

use App\Models\Payment;
use App\Services\ChatService;
use App\Services\BookingService;

class PaymentObserver
{
    public function created(Payment $payment): void
    {
        if ($payment->status === 'completed') {
            $this->finalizeAndCreateChat($payment);
        }
    }

    public function updated(Payment $payment): void
    {
        if ($payment->wasChanged('status') && $payment->status === 'completed') {
            $this->finalizeAndCreateChat($payment);
        }
    }

    protected function finalizeAndCreateChat(Payment $payment): void
    {
        $booking = $payment->booking;
        if (!$booking) {
            return;
        }

        app(BookingService::class)->finalizePaidBooking($booking);
        app(ChatService::class)->ensureChatForBooking($booking->fresh());
    }
}

