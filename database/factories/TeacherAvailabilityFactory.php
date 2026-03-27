<?php

namespace Database\Factories;

use App\Models\Teacher;
use App\Models\TeacherAvailability;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherAvailabilityFactory extends Factory
{
    protected $model = TeacherAvailability::class;

    public function definition(): array
    {
        $date = now()->addDay()->startOfDay();

        return [
            'teacher_id' => Teacher::factory(),
            'date' => $date->toDateString(),
            'start_time' => $date->copy()->setTime(10, 0, 0),
            'end_time' => $date->copy()->setTime(11, 0, 0),
            'status' => 'available',
            'booking_id' => null,
        ];
    }
}
