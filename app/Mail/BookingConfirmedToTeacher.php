<?php

namespace App\Mail;

use App\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmedToTeacher extends Mailable
{
    use Queueable, SerializesModels;

    public $booking;
    public $teacher;
    public $student;

    public function __construct(Booking $booking)
    {
        $this->booking = $booking;
        $this->teacher = $booking->teacher;
        $this->student = $booking->student;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم تأكيد الحجز - ' . ($this->booking->student_name ?? 'طالب'),
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.booking-confirmed-teacher',
            with: [
                'booking' => $this->booking,
                'teacher' => $this->teacher,
                'student' => $this->student,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

