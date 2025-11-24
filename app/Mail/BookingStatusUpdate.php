<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingStatusUpdate extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
    }

    public function envelope(): Envelope
    {
        $statusLabels = [
            'pending' => 'قيد الانتظار',
            'confirmed' => 'مؤكد',
            'cancelled' => 'ملغي',
            'completed' => 'مكتمل',
        ];

        return new Envelope(
            subject: 'تحديث حالة الطلب - ' . ($statusLabels[$this->booking->status] ?? $this->booking->status),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-status-update',
            with: [
                'booking' => $this->booking,
                'teacher' => $this->booking->teacher,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
