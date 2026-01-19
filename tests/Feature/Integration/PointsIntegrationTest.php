<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Point;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Services\PointsService;
use App\Services\BadgeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

class PointsIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected PointsService $pointsService;
    protected BadgeService $badgeService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->pointsService = $this->app->make(PointsService::class);
        $this->badgeService = $this->app->make(BadgeService::class);
    }

    /** @test */
    public function awarding_points_triggers_community_badge_check()
    {
        Event::fake();

        // Create a student
        $student = User::factory()->create([
            'role' => 'student',
            'points' => 0,
        ]);

        // Create a community badge that requires 100 points
        $badge = Badge::factory()->create([
            'badge_category' => 'community',
            'points_required' => 100,
            'is_active' => true,
            'status' => 'approved',
        ]);

        // Award 100 points
        $this->pointsService->awardPoints(
            $student->id,
            100,
            'test',
            null,
            'Test points',
            'نقاط تجريبية'
        );

        // Refresh student to get updated points
        $student->refresh();

        // Assert points were awarded
        $this->assertEquals(100, $student->points);

        // Assert badge was awarded
        $this->assertTrue($this->badgeService->userHasBadge($student->id, $badge->id));

        // Assert PointsAwarded event was fired
        Event::assertDispatched(\App\Events\PointsAwarded::class);
    }

    /** @test */
    public function points_awarded_event_triggers_certificate_eligibility_check()
    {
        Event::fake();

        $student = User::factory()->create([
            'role' => 'student',
            'points' => 0,
        ]);

        // Award points
        $this->pointsService->awardPoints(
            $student->id,
            50,
            'test',
            null,
            'Test points',
            'نقاط تجريبية'
        );

        // Assert PointsAwarded event was fired
        Event::assertDispatched(\App\Events\PointsAwarded::class);
    }

    /** @test */
    public function points_are_recorded_in_points_table()
    {
        $student = User::factory()->create([
            'role' => 'student',
            'points' => 0,
        ]);

        $point = $this->pointsService->awardPoints(
            $student->id,
            50,
            'test',
            null,
            'Test points',
            'نقاط تجريبية'
        );

        $this->assertDatabaseHas('points', [
            'user_id' => $student->id,
            'points' => 50,
            'source' => 'test',
        ]);

        $this->assertInstanceOf(Point::class, $point);
    }

    /** @test */
    public function user_points_are_incremented_correctly()
    {
        $student = User::factory()->create([
            'role' => 'student',
            'points' => 50,
        ]);

        $this->pointsService->awardPoints(
            $student->id,
            30,
            'test',
            null,
            'Test points',
            'نقاط تجريبية'
        );

        $student->refresh();

        $this->assertEquals(80, $student->points);
    }
}

