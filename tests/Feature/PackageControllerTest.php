<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use App\Models\UserPackage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Feature Tests for PackageController
 * 
 * Tests all HTTP endpoints and user interactions
 * 
 * @package Tests\Feature
 */
class PackageControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->admin = User::factory()->create(['role' => 'admin']);
    }

    /**
     * Test admin can view packages index
     */
    public function test_admin_can_view_packages_index(): void
    {
        Package::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.packages.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Packages/Index')
                ->has('packages', 5)
                ->has('stats')
        );
    }

    /**
     * Test admin can view create package form
     */
    public function test_admin_can_view_create_package_form(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.packages.create'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Packages/Create')
        );
    }

    /**
     * Test admin can create a package
     */
    public function test_admin_can_create_package(): void
    {
        $packageData = [
            'name' => 'Test Package',
            'name_ar' => 'باقة تجريبية',
            'description' => 'Test description',
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

        $response = $this->actingAs($this->admin)
            ->post(route('admin.packages.store'), $packageData);

        $response->assertRedirect(route('admin.packages.index'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('packages', [
            'name' => 'Test Package',
            'name_ar' => 'باقة تجريبية',
            'price' => 100.00,
        ]);
    }

    /**
     * Test validation when creating package
     */
    public function test_validation_when_creating_package(): void
    {
        $response = $this->actingAs($this->admin)
            ->post(route('admin.packages.store'), []);

        $response->assertSessionHasErrors(['name', 'price', 'currency', 'duration_type']);
    }

    /**
     * Test admin can view edit package form
     */
    public function test_admin_can_view_edit_package_form(): void
    {
        $package = Package::factory()->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.packages.edit', $package));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Packages/Edit')
                ->has('package')
                ->where('package.id', $package->id)
        );
    }

    /**
     * Test admin can update a package
     */
    public function test_admin_can_update_package(): void
    {
        $package = Package::factory()->create([
            'name' => 'Original Name',
            'price' => 100.00,
        ]);

        $updateData = [
            'name' => 'Updated Name',
            'name_ar' => $package->name_ar,
            'price' => 150.00,
            'currency' => $package->currency,
            'duration_type' => $package->duration_type,
        ];

        $response = $this->actingAs($this->admin)
            ->put(route('admin.packages.update', $package), $updateData);

        $response->assertRedirect(route('admin.packages.index'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'name' => 'Updated Name',
            'price' => 150.00,
        ]);
    }

    /**
     * Test admin can delete a package without active subscribers
     */
    public function test_admin_can_delete_package_without_active_subscribers(): void
    {
        $package = Package::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.packages.destroy', $package));

        $response->assertRedirect(route('admin.packages.index'));
        $response->assertSessionHas('success');
        
        $this->assertDatabaseMissing('packages', [
            'id' => $package->id,
        ]);
    }

    /**
     * Test admin cannot delete package with active subscribers
     */
    public function test_admin_cannot_delete_package_with_active_subscribers(): void
    {
        $package = Package::factory()->create();
        $user = User::factory()->create();
        
        UserPackage::factory()->create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.packages.destroy', $package));

        $response->assertRedirect(route('admin.packages.index'));
        $response->assertSessionHas('error');
        
        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
        ]);
    }

    /**
     * Test admin can toggle package status
     */
    public function test_admin_can_toggle_package_status(): void
    {
        $package = Package::factory()->create(['is_active' => true]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.packages.toggle-status', $package));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('packages', [
            'id' => $package->id,
            'is_active' => false,
        ]);
    }

    /**
     * Test admin can view package subscribers
     */
    public function test_admin_can_view_package_subscribers(): void
    {
        $package = Package::factory()->create();
        $users = User::factory()->count(5)->create();
        
        foreach ($users as $user) {
            UserPackage::factory()->create([
                'user_id' => $user->id,
                'package_id' => $package->id,
            ]);
        }

        $response = $this->actingAs($this->admin)
            ->get(route('admin.packages.subscribers', $package));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->component('Admin/Packages/Subscribers')
                ->has('package')
                ->has('subscribers')
                ->where('package.id', $package->id)
        );
    }

    /**
     * Test admin can update subscriber status
     */
    public function test_admin_can_update_subscriber_status(): void
    {
        $userPackage = UserPackage::factory()->create(['status' => 'active']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.packages.subscribers.update-status', $userPackage), [
                'status' => 'expired',
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('user_packages', [
            'id' => $userPackage->id,
            'status' => 'expired',
        ]);
    }

    /**
     * Test admin can cancel subscription
     */
    public function test_admin_can_cancel_subscription(): void
    {
        $userPackage = UserPackage::factory()->create(['status' => 'active']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.packages.subscribers.cancel', $userPackage));

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $this->assertDatabaseHas('user_packages', [
            'id' => $userPackage->id,
            'status' => 'cancelled',
        ]);
    }

    /**
     * Test admin can renew subscription
     */
    public function test_admin_can_renew_subscription(): void
    {
        $userPackage = UserPackage::factory()->create([
            'status' => 'active',
            'end_date' => now()->addMonth(),
        ]);

        $originalEndDate = $userPackage->end_date;

        $response = $this->actingAs($this->admin)
            ->post(route('admin.packages.subscribers.renew', $userPackage), [
                'months' => 3,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');
        
        $userPackage->refresh();
        $this->assertTrue($userPackage->end_date->isAfter($originalEndDate));
    }

    /**
     * Test non-admin cannot access packages
     */
    public function test_non_admin_cannot_access_packages(): void
    {
        $user = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($user)
            ->get(route('admin.packages.index'));

        $response->assertForbidden();
    }

    /**
     * Test unauthenticated user cannot access packages
     */
    public function test_unauthenticated_user_cannot_access_packages(): void
    {
        $response = $this->get(route('admin.packages.index'));

        $response->assertRedirect('/login');
    }

    /**
     * Test search functionality
     */
    public function test_can_search_packages(): void
    {
        Package::factory()->create(['name_ar' => 'باقة خاصة']);
        Package::factory()->create(['name_ar' => 'باقة عادية']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.packages.index', ['search' => 'خاصة']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->has('packages', 1)
        );
    }

    /**
     * Test filtering by status
     */
    public function test_can_filter_packages_by_status(): void
    {
        Package::factory()->count(3)->create(['is_active' => true]);
        Package::factory()->count(2)->create(['is_active' => false]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.packages.index', ['status' => 'active']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => 
            $page->has('packages', 3)
        );
    }
}









