<?php

namespace Database\Factories;

use App\Models\Challenge;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChallengeFactory extends Factory
{
    protected $model = Challenge::class;

    public function definition(): array
    {
        return [
            'created_by' => User::factory(),
            'school_id' => null,
            'title' => $this->faker->sentence(),
            'objective' => $this->faker->paragraph(),
            'description' => $this->faker->text(),
            'instructions' => $this->faker->paragraph(),
            'challenge_type' => $this->faker->randomElement(['60_seconds', 'mental_math', 'conversions', 'team_fastest', 'build_problem', 'custom']),
            'category' => $this->faker->randomElement(['science', 'technology', 'engineering', 'mathematics', 'arts', 'other']),
            'age_group' => $this->faker->randomElement(['6-9', '10-13', '14-17', '18+']),
            'start_date' => now(),
            'deadline' => now()->addDays(30),
            'status' => 'active',
            'points_reward' => $this->faker->numberBetween(10, 100),
            'max_participants' => $this->faker->numberBetween(10, 100),
            'current_participants' => 0,
        ];
    }
}

