<?php

namespace Tests\Feature;

use App\Models\Package;
use App\Models\User;
use App\Models\UserPackage;
use App\Services\MembershipAccessService;
use App\Services\PackageService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PackageAccessBehaviorTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_dashboard_remains_accessible_when_no_packages_exist(): void
    {
        Package::query()->delete();

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'membership_type' => 'subscription',
            'contract_status' => 'inactive',
        ]);

        $summary = app(MembershipAccessService::class)->getMembershipSummary($teacher);

        $this->assertFalse($summary['packages_available']);
        $this->assertFalse($summary['needs_renewal']);
        $this->assertNull($summary['subscription']);
        $this->assertTrue($summary['certificate_access']);

        $response = $this->actingAs($teacher)->get('/teacher/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Teacher/Dashboard')
            ->where('membershipSummary.packages_available', false)
            ->where('membershipSummary.needs_renewal', false)
            ->where('membershipSummary.subscription', null)
        );
    }

    public function test_deleted_packages_do_not_appear_in_subscription_history(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $package = Package::factory()->create(['is_active' => true]);

        UserPackage::factory()->create([
            'user_id' => $student->id,
            'package_id' => $package->id,
            'status' => 'cancelled',
        ]);

        app(PackageService::class)->deletePackage($package);

        $response = $this->actingAs($student)->get('/my-subscriptions');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Packages/MySubscriptions')
            ->has('subscriptions', 0)
            ->where('membershipSummary.packages_available', true)
        );
    }
}
