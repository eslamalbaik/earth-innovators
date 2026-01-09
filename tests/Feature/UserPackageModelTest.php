<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use App\Models\UserPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Integration Tests for UserPackage Model
 * 
 * Tests UserPackage model relationships and behaviors
 * 
 * @package Tests\Feature
 */
class UserPackageModelTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user package belongs to user
     */
    public function test_user_package_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $userPackage = UserPackage::factory()->create([
            'user_id' => $user->id,
        ]);

        $this->assertInstanceOf(User::class, $userPackage->user);
        $this->assertEquals($user->id, $userPackage->user->id);
    }

    /**
     * Test user package belongs to package
     */
    public function test_user_package_belongs_to_package(): void
    {
        $package = Package::factory()->create();
        $userPackage = UserPackage::factory()->create([
            'package_id' => $package->id,
        ]);

        $this->assertInstanceOf(Package::class, $userPackage->package);
        $this->assertEquals($package->id, $userPackage->package->id);
    }

    /**
     * Test user package dates are cast correctly
     */
    public function test_user_package_dates_are_cast_correctly(): void
    {
        $startDate = now();
        $endDate = now()->addMonth();
        
        $userPackage = UserPackage::factory()->create([
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        $this->assertInstanceOf(\Carbon\Carbon::class, $userPackage->start_date);
        $this->assertInstanceOf(\Carbon\Carbon::class, $userPackage->end_date);
        $this->assertTrue($userPackage->start_date->isSameDay($startDate));
        $this->assertTrue($userPackage->end_date->isSameDay($endDate));
    }

    /**
     * Test user package paid amount is cast to decimal
     */
    public function test_user_package_paid_amount_is_cast_to_decimal(): void
    {
        $userPackage = UserPackage::factory()->create([
            'paid_amount' => 150.75,
        ]);

        $this->assertIsFloat($userPackage->paid_amount);
        $this->assertEquals(150.75, $userPackage->paid_amount);
    }

    /**
     * Test user package auto_renew is cast to boolean
     */
    public function test_user_package_auto_renew_is_cast_to_boolean(): void
    {
        $userPackage = UserPackage::factory()->create([
            'auto_renew' => true,
        ]);

        $this->assertIsBool($userPackage->auto_renew);
        $this->assertTrue($userPackage->auto_renew);
    }

    /**
     * Test user package status values
     */
    public function test_user_package_status_values(): void
    {
        $statuses = ['active', 'expired', 'cancelled'];
        
        foreach ($statuses as $status) {
            $userPackage = UserPackage::factory()->create([
                'status' => $status,
            ]);
            
            $this->assertEquals($status, $userPackage->status);
        }
    }

    /**
     * Test user package can be deleted when user is deleted
     */
    public function test_user_package_is_deleted_when_user_is_deleted(): void
    {
        $user = User::factory()->create();
        $userPackage = UserPackage::factory()->create([
            'user_id' => $user->id,
        ]);

        $user->delete();

        $this->assertDatabaseMissing('user_packages', [
            'id' => $userPackage->id,
        ]);
    }

    /**
     * Test user package can be deleted when package is deleted
     */
    public function test_user_package_is_deleted_when_package_is_deleted(): void
    {
        $package = Package::factory()->create();
        $userPackage = UserPackage::factory()->create([
            'package_id' => $package->id,
        ]);

        $package->delete();

        $this->assertDatabaseMissing('user_packages', [
            'id' => $userPackage->id,
        ]);
    }
}









