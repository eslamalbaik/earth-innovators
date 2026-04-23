<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Teacher;
use App\Models\Booking;
use App\Models\TeacherAvailability;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class BookingServiceTest extends TestCase
{
    use RefreshDatabase;

    private BookingService $bookingService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->bookingService = app(BookingService::class);
    }

    public function test_can_create_booking(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $teacher = Teacher::factory()->create();
        $availability = TeacherAvailability::factory()->create([
            'teacher_id' => $teacher->id,
            'status' => 'available',
        ]);

        $booking = $this->bookingService->createBooking([
            'student_id' => $student->id,
            'teacher_id' => $teacher->user_id,
            'availability_id' => $availability->id,
            'subject' => 'Math',
            'price' => 100,
        ]);

        $expected = [
            'id' => $booking->id,
            'teacher_id' => $teacher->id,
            'status' => 'pending',
        ];

        if (Schema::hasColumn('bookings', 'student_id')) {
            $expected['student_id'] = $student->id;
        } else {
            $expected['student_email'] = $student->email;
        }

        $this->assertDatabaseHas('bookings', $expected);
    }

    public function test_can_update_booking_status(): void
    {
        $booking = Booking::factory()->create(['status' => 'pending']);

        $this->bookingService->updateBookingStatus($booking->id, 'approved');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }
}
