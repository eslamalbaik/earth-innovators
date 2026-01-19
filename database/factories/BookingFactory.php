<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\User;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    protected $model = Booking::class;

    public function definition(): array
    {
        $teacher = Teacher::factory()->create();
        $student = User::factory()->create(['role' => 'student']);
        
        return [
            'teacher_id' => $teacher->id,
            'student_name' => $student->name,
            'student_phone' => $this->faker->phoneNumber(),
            'student_email' => $student->email,
            'city' => $this->faker->city(),
            'neighborhood' => $this->faker->streetName(),
            'subject' => $this->faker->sentence(),
            'selected_sessions' => [],
            'status' => 'pending',
            'total_price' => $this->faker->randomFloat(2, 50, 500),
            'payment_received' => false,
        ];
    }
}
