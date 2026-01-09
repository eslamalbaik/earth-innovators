<?php

namespace Database\Factories;

use App\Models\Package;
use App\Models\User;
use App\Models\UserPackage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * UserPackage Factory
 * 
 * Factory for creating test UserPackage instances
 * 
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\UserPackage>
 */
class UserPackageFactory extends Factory
{
    protected $model = UserPackage::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = fake()->dateTimeBetween('-1 month', 'now');
        $endDate = fake()->dateTimeBetween('now', '+1 year');
        $statuses = ['active', 'expired', 'cancelled'];
        $paymentMethods = ['credit_card', 'bank_transfer', 'paypal', 'cash'];
        
        return [
            'user_id' => User::factory(),
            'package_id' => Package::factory(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'status' => fake()->randomElement($statuses),
            'auto_renew' => fake()->boolean(30),
            'paid_amount' => fake()->randomFloat(2, 50, 1000),
            'payment_method' => fake()->randomElement($paymentMethods),
            'transaction_id' => fake()->uuid(),
        ];
    }

    /**
     * Indicate that the subscription is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'active',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonth(),
        ]);
    }

    /**
     * Indicate that the subscription is expired.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'expired',
            'start_date' => now()->subMonths(3),
            'end_date' => now()->subMonth(),
        ]);
    }

    /**
     * Indicate that the subscription is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'cancelled',
            'start_date' => now()->subMonth(),
            'end_date' => now()->addMonth(),
        ]);
    }

    /**
     * Indicate that the subscription has auto-renew enabled.
     */
    public function autoRenew(): static
    {
        return $this->state(fn (array $attributes) => [
            'auto_renew' => true,
        ]);
    }
}
