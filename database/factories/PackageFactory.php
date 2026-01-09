<?php

namespace Database\Factories;

use App\Models\Package;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Package Factory
 * 
 * Factory for creating test Package instances
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Package>
 */
class PackageFactory extends Factory
{
    protected $model = Package::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $currencies = ['SAR', 'USD', 'AED'];
        $durationTypes = ['monthly', 'quarterly', 'yearly', 'lifetime'];
        
        return [
            'name' => fake()->words(3, true) . ' Package',
            'name_ar' => 'باقة ' . fake('ar_SA')->words(2, true),
            'description' => fake()->sentence(),
            'description_ar' => fake('ar_SA')->sentence(),
            'price' => fake()->randomFloat(2, 50, 1000),
            'currency' => fake()->randomElement($currencies),
            'duration_type' => fake()->randomElement($durationTypes),
            'duration_months' => fake()->numberBetween(1, 12),
            'points_bonus' => fake()->numberBetween(0, 500),
            'projects_limit' => fake()->optional()->numberBetween(5, 100),
            'challenges_limit' => fake()->optional()->numberBetween(3, 50),
            'certificate_access' => fake()->boolean(70),
            'badge_access' => fake()->boolean(80),
            'features' => [
                fake()->sentence(),
                fake()->sentence(),
                fake()->sentence(),
            ],
            'features_ar' => [
                fake('ar_SA')->sentence(),
                fake('ar_SA')->sentence(),
            ],
            'is_active' => true,
            'is_popular' => fake()->boolean(30),
        ];
    }

    /**
     * Indicate that the package is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the package is popular.
     */
    public function popular(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_popular' => true,
        ]);
    }

    /**
     * Indicate that the package is free.
     */
    public function free(): static
    {
        return $this->state(fn (array $attributes) => [
            'price' => 0,
        ]);
    }

    /**
     * Indicate that the package has unlimited projects.
     */
    public function unlimitedProjects(): static
    {
        return $this->state(fn (array $attributes) => [
            'projects_limit' => null,
        ]);
    }

    /**
     * Indicate that the package has unlimited challenges.
     */
    public function unlimitedChallenges(): static
    {
        return $this->state(fn (array $attributes) => [
            'challenges_limit' => null,
        ]);
    }
}
