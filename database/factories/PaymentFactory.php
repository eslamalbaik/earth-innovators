<?php

namespace Database\Factories;

use App\Models\Payment;
use App\Models\User;
use App\Models\Teacher;
use App\Models\Booking;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        $teacher = Teacher::factory()->create();
        $student = User::factory()->create(['role' => 'student']);
        $booking = Booking::factory()->create();
        
        return [
            'student_id' => $student->id,
            'teacher_id' => $teacher->id,
            'booking_id' => $booking->id,
            'amount' => $this->faker->randomFloat(2, 10, 1000),
            'currency' => 'AED',
            'status' => 'pending',
            'payment_method' => $this->faker->randomElement(['tamara', 'ziina', 'card']),
            'payment_gateway' => $this->faker->randomElement(['Tamara', 'Ziina']),
            'transaction_id' => 'TXN-' . strtoupper($this->faker->bothify('??####??')),
            'payment_reference' => 'REF-' . $this->faker->randomNumber(8),
            'gateway_response' => [],
            'paid_at' => null,
        ];
    }
}
