<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    private DashboardService $dashboardService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->dashboardService = app(DashboardService::class);
    }

    public function test_can_get_school_dashboard_stats(): void
    {
        $school = User::factory()->create(['role' => 'school']);
        User::factory()->count(10)->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);

        $stats = $this->dashboardService->getSchoolDashboardStats($school->id);

        $this->assertArrayHasKey('students_count', $stats);
        $this->assertEquals(10, $stats['students_count']);
    }

    public function test_dashboard_stats_are_cached(): void
    {
        $school = User::factory()->create(['role' => 'school']);

        $stats1 = $this->dashboardService->getSchoolDashboardStats($school->id);
        $stats2 = $this->dashboardService->getSchoolDashboardStats($school->id);

        $this->assertEquals($stats1, $stats2);
    }
}

