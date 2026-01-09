<?php

namespace Tests\Unit\Services;

use App\Models\Package;
use App\Models\User;
use App\Models\UserPackage;
use App\Services\PackageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

/**
 * Unit Tests for PackageService
 * 
 * Tests all business logic methods in PackageService
 * 
 * @package Tests\Unit\Services
 */
class PackageServiceTest extends TestCase
{
    use RefreshDatabase;

    private PackageService $packageService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->packageService = app(PackageService::class);
        
        // Clear cache before each test
        Cache::flush();
    }

    /**
     * Test creating a new package
     */
    public function test_can_create_package(): void
    {
        $data = [
            'name' => 'Test Package',
            'name_ar' => 'باقة تجريبية',
            'description' => 'Test description',
            'description_ar' => 'وصف تجريبي',
            'price' => 100.00,
            'currency' => 'SAR',
            'duration_type' => 'monthly',
            'duration_months' => 1,
            'points_bonus' => 50,
            'projects_limit' => 10,
            'challenges_limit' => 5,
            'certificate_access' => true,
            'badge_access' => true,
            'features' => ['Feature 1', 'Feature 2'],
            'features_ar' => ['ميزة 1', 'ميزة 2'],
            'is_active' => true,
            'is_popular' => false,
        ];

        $package = $this->packageService->createPackage($data);

        $this->assertInstanceOf(Package::class, $package);
        $this->assertEquals('Test Package', $package->name);
        $this->assertEquals('باقة تجريبية', $package->name_ar);
        $this->assertEquals(100.00, $package->price);
        $this->assertTrue($package->is_active);
        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'name' => 'Test Package',
        ]);
    }

    /**
     * Test creating package with empty features
     */
    public function test_create_package_removes_empty_features(): void
    {
        $data = [
            'name' => 'Test Package',
            'price' => 100.00,
            'currency' => 'SAR',
            'duration_type' => 'monthly',
            'features' => ['Feature 1', '', '   ', 'Feature 2'],
            'features_ar' => ['ميزة 1', '', '   '],
        ];

        $package = $this->packageService->createPackage($data);

        $this->assertCount(2, $package->features);
        $this->assertCount(1, $package->features_ar);
        $this->assertNotContains('', $package->features);
    }

    /**
     * Test updating a package
     */
    public function test_can_update_package(): void
    {
        $package = Package::factory()->create([
            'name' => 'Original Name',
            'price' => 100.00,
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'price' => 150.00,
        ];

        $updatedPackage = $this->packageService->updatePackage($package, $updateData);

        $this->assertEquals('Updated Name', $updatedPackage->name);
        $this->assertEquals(150.00, $updatedPackage->price);
        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'name' => 'Updated Name',
            'price' => 150.00,
        ]);
    }

    /**
     * Test deleting a package without active subscribers
     */
    public function test_can_delete_package_without_active_subscribers(): void
    {
        $package = Package::factory()->create();

        $result = $this->packageService->deletePackage($package);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('packages', [
            'id' => $package->id,
        ]);
    }

    /**
     * Test cannot delete package with active subscribers
     */
    public function test_cannot_delete_package_with_active_subscribers(): void
    {
        $package = Package::factory()->create();
        $user = User::factory()->create();
        
        UserPackage::factory()->create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('لا يمكن حذف الباقة لأنها تحتوي على');

        $this->packageService->deletePackage($package);
    }

    /**
     * Test can delete package with expired subscribers
     */
    public function test_can_delete_package_with_expired_subscribers(): void
    {
        $package = Package::factory()->create();
        $user = User::factory()->create();
        
        UserPackage::factory()->create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'status' => 'expired',
        ]);

        $result = $this->packageService->deletePackage($package);

        $this->assertTrue($result);
    }

    /**
     * Test getting all packages with filters
     */
    public function test_can_get_all_packages_with_filters(): void
    {
        Package::factory()->count(3)->create(['is_active' => true]);
        Package::factory()->count(2)->create(['is_active' => false]);

        $activePackages = $this->packageService->getAllPackages(['status' => 'active']);

        $this->assertCount(3, $activePackages);
        $activePackages->each(function ($package) {
            $this->assertTrue($package->is_active);
        });
    }

    /**
     * Test getting packages sorted by price
     */
    public function test_can_get_packages_sorted_by_price(): void
    {
        Package::factory()->create(['price' => 300.00]);
        Package::factory()->create(['price' => 100.00]);
        Package::factory()->create(['price' => 200.00]);

        $packages = $this->packageService->getAllPackages([], 'price', 'asc');

        $this->assertEquals(100.00, $packages->first()->price);
        $this->assertEquals(300.00, $packages->last()->price);
    }

    /**
     * Test getting package statistics
     */
    public function test_can_get_package_stats(): void
    {
        Package::factory()->count(5)->create(['is_active' => true]);
        Package::factory()->count(2)->create(['is_active' => false]);
        Package::factory()->count(2)->create(['is_popular' => true]);

        $stats = $this->packageService->getPackageStats();

        $this->assertEquals(7, $stats['total']);
        $this->assertEquals(5, $stats['active']);
        $this->assertEquals(2, $stats['popular']);
        $this->assertArrayHasKey('totalSubscribers', $stats);
        $this->assertArrayHasKey('totalRevenue', $stats);
        $this->assertArrayHasKey('monthlyRevenue', $stats);
    }

    /**
     * Test toggling package status
     */
    public function test_can_toggle_package_status(): void
    {
        $package = Package::factory()->create(['is_active' => true]);

        $updatedPackage = $this->packageService->togglePackageStatus($package, false);

        $this->assertFalse($updatedPackage->is_active);
        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test getting package subscribers with pagination
     */
    public function test_can_get_package_subscribers_with_pagination(): void
    {
        $package = Package::factory()->create();
        $users = User::factory()->count(25)->create();

        foreach ($users as $user) {
            UserPackage::factory()->create([
                'user_id' => $user->id,
                'package_id' => $package->id,
            ]);
        }

        $subscribers = $this->packageService->getPackageSubscribers($package->id, 10);

        $this->assertCount(10, $subscribers->items());
        $this->assertEquals(25, $subscribers->total());
    }

    /**
     * Test updating subscriber status
     */
    public function test_can_update_subscriber_status(): void
    {
        $userPackage = UserPackage::factory()->create(['status' => 'active']);

        $updated = $this->packageService->updateSubscriberStatus($userPackage, 'expired');

        $this->assertEquals('expired', $updated->status);
        $this->assertDatabaseHas('user_packages', [
            'id' => $userPackage->id,
            'status' => 'expired',
        ]);
    }

    /**
     * Test cannot update to invalid status
     */
    public function test_cannot_update_to_invalid_status(): void
    {
        $userPackage = UserPackage::factory()->create();

        $this->expectException(\InvalidArgumentException::class);

        $this->packageService->updateSubscriberStatus($userPackage, 'invalid_status');
    }

    /**
     * Test canceling subscription
     */
    public function test_can_cancel_subscription(): void
    {
        $userPackage = UserPackage::factory()->create(['status' => 'active']);

        $cancelled = $this->packageService->cancelSubscription($userPackage);

        $this->assertEquals('cancelled', $cancelled->status);
    }

    /**
     * Test renewing subscription
     */
    public function test_can_renew_subscription(): void
    {
        $userPackage = UserPackage::factory()->create([
            'status' => 'active',
            'end_date' => now()->addMonth(),
        ]);

        $renewed = $this->packageService->renewSubscription($userPackage, 3);

        $this->assertEquals('active', $renewed->status);
        $this->assertTrue($renewed->end_date->isAfter($userPackage->end_date));
    }

    /**
     * Test caching of packages
     */
    public function test_packages_are_cached(): void
    {
        Package::factory()->count(3)->create();

        // First call - should hit database
        $packages1 = $this->packageService->getAllPackages();

        // Second call - should use cache
        $packages2 = $this->packageService->getAllPackages();

        $this->assertEquals($packages1->count(), $packages2->count());
    }

    /**
     * Test cache is cleared after package creation
     */
    public function test_cache_is_cleared_after_package_creation(): void
    {
        Package::factory()->count(2)->create();
        
        // Populate cache
        $this->packageService->getAllPackages();
        
        // Create new package
        $this->packageService->createPackage([
            'name' => 'New Package',
            'price' => 100.00,
            'currency' => 'SAR',
            'duration_type' => 'monthly',
        ]);

        // Cache should be cleared, new package should appear
        $packages = $this->packageService->getAllPackages();
        $this->assertCount(3, $packages);
    }
}









