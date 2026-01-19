<?php

namespace Database\Factories;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherFactory extends Factory
{
    protected $model = Teacher::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory()->create(['role' => 'teacher'])->id,
            'name_ar' => $this->faker->name(),
            'name_en' => $this->faker->name(),
            'nationality' => 'SA',
            'gender' => $this->faker->randomElement(['male', 'female']),
            'bio' => $this->faker->paragraph(),
            'qualifications' => $this->faker->sentence(),
            'subjects' => [],
            'stages' => [],
            'experience_years' => $this->faker->numberBetween(1, 20),
            'city' => $this->faker->city(),
            'neighborhoods' => [],
            'price_per_hour' => $this->faker->randomFloat(2, 50, 500),
            'is_verified' => true,
            'is_active' => true,
        ];
    }
}

