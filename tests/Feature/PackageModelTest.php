<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use App\Models\UserPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Integration Tests for Package Model
 * 
 * Tests Package model relationships and behaviors
 * 
 * @package Tests\Feature
 */
class PackageModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test package has many users through user_packages
     */
    public function test_package_has_many_users(): void
    {
        $package = Package::factory()->create();
        $users = User::factory()->count(3)->create();

        foreach ($users as $user) {
            UserPackage::factory()->create([
                'user_id' => $user->id,
                'package_id' => $package->id,
            ]);
        }

        $this->assertCount(3, $package->users);
        $this->assertTrue($package->users->contains($users->first()));
    }

    /**
     * Test package features are cast to array
     */
    public function test_package_features_are_cast_to_array(): void
    {
        $package = Package::factory()->create([
            'features' => ['Feature 1', 'Feature 2'],
            'features_ar' => ['ميزة 1', 'ميزة 2'],
        ]);

        $this->assertIsArray($package->features);
        $this->assertIsArray($package->features_ar);
        $this->assertCount(2, $package->features);
        $this->assertCount(2, $package->features_ar);
    }

    /**
     * Test package boolean fields are cast correctly
     */
    public function test_package_boolean_fields_are_cast_correctly(): void
    {
        $package = Package::factory()->create([
            'is_active' => true,
            'is_popular' => false,
            'certificate_access' => true,
            'badge_access' => false,
        ]);

        $this->assertIsBool($package->is_active);
        $this->assertIsBool($package->is_popular);
        $this->assertIsBool($package->certificate_access);
        $this->assertIsBool($package->badge_access);
        $this->assertTrue($package->is_active);
        $this->assertFalse($package->is_popular);
    }

    /**
     * Test package price is cast to decimal
     */
    public function test_package_price_is_cast_to_decimal(): void
    {
        $package = Package::factory()->create([
            'price' => 100.50,
        ]);

        $this->assertIsFloat($package->price);
        $this->assertEquals(100.50, $package->price);
    }

    /**
     * Test package can have unlimited projects (null limit)
     */
    public function test_package_can_have_unlimited_projects(): void
    {
        $package = Package::factory()->create([
            'projects_limit' => null,
        ]);

        $this->assertNull($package->projects_limit);
    }

    /**
     * Test package can have unlimited challenges (null limit)
     */
    public function test_package_can_have_unlimited_challenges(): void
    {
        $package = Package::factory()->create([
            'challenges_limit' => null,
        ]);

        $this->assertNull($package->challenges_limit);
    }

    /**
     * Test package duration types
     */
    public function test_package_duration_types(): void
    {
        $types = ['monthly', 'quarterly', 'yearly', 'lifetime'];
        
        foreach ($types as $type) {
            $package = Package::factory()->create([
                'duration_type' => $type,
            ]);
            
            $this->assertEquals($type, $package->duration_type);
        }
    }

    /**
     * Test package currencies
     */
    public function test_package_currencies(): void
    {
        $currencies = ['SAR', 'USD', 'AED'];
        
        foreach ($currencies as $currency) {
            $package = Package::factory()->create([
                'currency' => $currency,
            ]);
            
            $this->assertEquals($currency, $package->currency);
        }
    }

    /**
     * Test package user relationship with pivot data
     */
    public function test_package_user_relationship_has_pivot_data(): void
    {
        $package = Package::factory()->create();
        $user = User::factory()->create();
        
        $userPackage = UserPackage::factory()->create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'start_date' => now(),
            'end_date' => now()->addMonth(),
            'status' => 'active',
            'auto_renew' => true,
            'paid_amount' => 100.00,
        ]);

        $packageUser = $package->users()->first();
        
        $this->assertNotNull($packageUser->pivot->start_date);
        $this->assertNotNull($packageUser->pivot->end_date);
        $this->assertEquals('active', $packageUser->pivot->status);
    }
}









