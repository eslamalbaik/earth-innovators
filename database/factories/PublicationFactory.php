<?php

namespace Database\Factories;

use App\Models\Publication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class PublicationFactory extends Factory
{
    protected $model = Publication::class;

    public function definition(): array
    {
        return [
            'author_id' => User::factory(),
            'school_id' => null,
            'title' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'type' => $this->faker->randomElement(['magazine', 'booklet', 'report']),
            'status' => 'pending',
            'approved_by' => null,
            'approved_at' => null,
            'publish_date' => now(),
            'publisher_name' => $this->faker->name(),
            'likes_count' => 0,
        ];
    }
}

