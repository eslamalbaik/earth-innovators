<?php

namespace Database\Factories;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class BadgeFactory extends Factory
{
    protected $model = Badge::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'name_ar' => 'شارة ' . $this->faker->randomNumber(3),
            'description' => $this->faker->sentence(),
            'description_ar' => $this->faker->sentence(),
            'badge_category' => $this->faker->randomElement(['achievement', 'community']),
            'points_required' => $this->faker->numberBetween(0, 1000),
            'is_active' => true,
            'status' => 'approved',
            'created_by' => User::factory(),
        ];
    }

    public function community(): static
    {
        return $this->state(fn (array $attributes) => [
            'badge_category' => 'community',
        ]);
    }

    public function achievement(): static
    {
        return $this->state(fn (array $attributes) => [
            'badge_category' => 'achievement',
        ]);
    }
}

