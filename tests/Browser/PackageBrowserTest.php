<?php

namespace Tests\Browser;

use App\Models\Package;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Laravel\Dusk\Browser;
use Tests\DuskTestCase;

/**
 * Browser Tests for Package Management
 * 
 * Tests UI interactions and browser compatibility
 * Note: Requires Dusk to be installed and configured
 * 
 * @package Tests\Browser
 */
class PackageBrowserTest extends DuskTestCase
{
    use DatabaseMigrations;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
        ]);
    }

    /**
     * Test admin can navigate to packages index
     */
    public function test_admin_can_navigate_to_packages_index(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/admin/packages')
                ->assertSee('إدارة الباقات')
                ->assertSee('قائمة الباقات');
        });
    }

    /**
     * Test admin can create a package through UI
     */
    public function test_admin_can_create_package_through_ui(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/admin/packages')
                ->clickLink('إضافة باقة جديدة')
                ->assertPathIs('/admin/packages/create')
                ->type('name', 'Test Package')
                ->type('name_ar', 'باقة تجريبية')
                ->type('price', '100')
                ->select('currency', 'SAR')
                ->select('duration_type', 'monthly')
                ->check('is_active')
                ->press('حفظ')
                ->assertPathIs('/admin/packages')
                ->assertSee('Test Package');
        });
    }

    /**
     * Test admin can edit a package through UI
     */
    public function test_admin_can_edit_package_through_ui(): void
    {
        $package = Package::factory()->create([
            'name' => 'Original Name',
            'price' => 100.00,
        ]);

        $this->browse(function (Browser $browser) use ($package) {
            $browser->loginAs($this->admin)
                ->visit('/admin/packages')
                ->click("@edit-package-{$package->id}")
                ->assertPathIs("/admin/packages/{$package->id}/edit")
                ->type('name', 'Updated Name')
                ->type('price', '150')
                ->press('حفظ التغييرات')
                ->assertPathIs('/admin/packages')
                ->assertSee('Updated Name');
        });
    }

    /**
     * Test admin can delete a package through UI
     */
    public function test_admin_can_delete_package_through_ui(): void
    {
        $package = Package::factory()->create([
            'name' => 'Package to Delete',
        ]);

        $this->browse(function (Browser $browser) use ($package) {
            $browser->loginAs($this->admin)
                ->visit('/admin/packages')
                ->click("@delete-package-{$package->id}")
                ->acceptDialog()
                ->waitForText('تم حذف الباقة بنجاح')
                ->assertDontSee('Package to Delete');
        });
    }

    /**
     * Test search functionality in UI
     */
    public function test_search_functionality_in_ui(): void
    {
        Package::factory()->create(['name_ar' => 'باقة خاصة']);
        Package::factory()->create(['name_ar' => 'باقة عادية']);

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/admin/packages')
                ->type('search', 'خاصة')
                ->press('بحث')
                ->assertSee('باقة خاصة')
                ->assertDontSee('باقة عادية');
        });
    }

    /**
     * Test responsive design on mobile
     */
    public function test_responsive_design_on_mobile(): void
    {
        Package::factory()->count(3)->create();

        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->resize(375, 667) // iPhone size
                ->visit('/admin/packages')
                ->assertSee('إدارة الباقات')
                ->assertSee('قائمة الباقات');
        });
    }

    /**
     * Test RTL support
     */
    public function test_rtl_support(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->loginAs($this->admin)
                ->visit('/admin/packages/create')
                ->assertAttribute('html', 'dir', 'rtl')
                ->assertSee('إضافة باقة جديدة');
        });
    }
}









