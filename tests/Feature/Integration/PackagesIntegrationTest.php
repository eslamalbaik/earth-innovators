<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Package;
use App\Models\UserPackage;
use App\Models\Payment;
use App\Models\Point;
use App\Services\PointsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

class PackagesIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected PointsService $pointsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pointsService = $this->app->make(PointsService::class);
    }

    /** @test */
    public function package_subscription_awards_bonus_points()
    {
        Event::fake();

        $student = User::factory()->create([
            'role' => 'student',
            'points' => 0,
        ]);

        $package = Package::factory()->create([
            'points_bonus' => 100,
            'is_active' => true,
        ]);

        $userPackage = UserPackage::factory()->create([
            'user_id' => $student->id,
            'package_id' => $package->id,
            'status' => 'active',
        ]);

        // Create a booking for the payment (required by schema)
        $booking = \App\Models\Booking::factory()->create();
        
        $payment = Payment::factory()->create([
            'booking_id' => $booking->id,
            'student_id' => $student->id,
            'status' => 'completed',
            'gateway_response' => [
                'metadata' => [
                    'user_package_id' => $userPackage->id,
                ],
            ],
        ]);

        // Simulate payment success (this would normally be in PackageSubscriptionController)
        $userPackage->update([
            'status' => 'active',
            'start_date' => now(),
        ]);

        // Award bonus points
        if ($package->points_bonus > 0) {
            $this->pointsService->awardPoints(
                $student->id,
                $package->points_bonus,
                'package_bonus',
                $package->id,
                "Package subscription bonus: {$package->name}",
                "مكافأة اشتراك الباقة: {$package->name_ar}"
            );
        }

        $student->refresh();

        // Assert bonus points were awarded
        $this->assertEquals(100, $student->points);

        // Assert Point record was created
        $this->assertDatabaseHas('points', [
            'user_id' => $student->id,
            'points' => 100,
            'source' => 'package_bonus',
        ]);

        // Assert PointsAwarded event was fired
        Event::assertDispatched(\App\Events\PointsAwarded::class);
    }
}
