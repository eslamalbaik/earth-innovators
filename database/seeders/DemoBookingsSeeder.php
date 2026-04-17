<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoBookingsSeeder extends Seeder
{
    /**
     * @param array{
     *  teachers: array<int,Teacher>,
     *  students: array<int,User>
     * } $context
     */
    public function run(array $context): void
    {
        $teachers = $context['teachers'];
        $students = $context['students'];

        if (count($teachers) === 0 || count($students) === 0) {
            return;
        }

        for ($i = 0; $i < 6; $i++) {
            $teacher = $teachers[$i % count($teachers)];
            $student = $students[$i % count($students)];

            $booking = Booking::create([
                'teacher_id' => $teacher->id,
                'student_name' => $student->name,
                'student_phone' => $student->phone ?? '+971500000000',
                'student_email' => $student->email,
                'city' => 'Dubai',
                'neighborhood' => 'Business Bay',
                'subject' => 'Mathematics',
                'selected_sessions' => [
                    ['date' => now()->addDays($i + 1)->toDateString(), 'time' => '17:00', 'duration' => 60],
                ],
                'total_price' => 150,
                'notes' => null,
                'status' => $i % 3 === 0 ? 'completed' : 'confirmed',
                'payment_received' => true,
                'payment_received_at' => now()->subDays(1),
            ]);

            Payment::create([
                'booking_id' => $booking->id,
                'student_id' => $student->id,
                'teacher_id' => $teacher->id,
                'amount' => 150,
                'currency' => 'AED',
                'status' => 'completed',
                'payment_method' => 'demo',
                'payment_gateway' => 'Demo',
                'transaction_id' => 'DEMO-TXN-' . $booking->id,
                'gateway_payment_id' => null,
                'gateway_response' => json_encode(['demo' => true]),
                'payment_reference' => 'DEMO-REF-' . $booking->id,
                'paid_at' => now()->subDays(1),
            ]);

            if ($i % 2 === 0) {
                Review::create([
                    'teacher_id' => $teacher->id,
                    'student_id' => $student->id,
                    'booking_id' => $booking->id,
                    'reviewer_name' => $student->name,
                    'reviewer_location' => 'Dubai',
                    'rating' => 5,
                    'comment' => 'Great session (demo)!',
                    'teacher_response' => null,
                    'is_published' => true,
                ]);
            }
        }
    }
}
