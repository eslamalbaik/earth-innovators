<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectFactory extends Factory
{
    protected $model = Project::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'school_id' => null,
            'teacher_id' => null,
            'title' => $this->faker->sentence(),
            'description' => $this->faker->text(),
            'status' => 'pending',
            'points_earned' => 0,
        ];
    }
}

