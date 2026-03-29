<?php

namespace Tests\Feature;

use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\User;
use App\Notifications\ProjectEvaluatedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class StudentDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    public function test_guest_is_redirected_from_dashboard_routes(): void
    {
        $this->get('/dashboard')->assertRedirect();
        $this->get('/student/dashboard')->assertRedirect();
    }

    public function test_student_can_view_main_dashboard(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Dashboard')
            ->has('stats')
            ->has('communityScorePercent')
            ->has('engagement')
            ->where('stats.totalPoints', fn ($v) => is_numeric($v))
            ->has('stats.recentProjects')
            ->has('stats.activeChallenges')
        );
    }

    public function test_student_can_view_student_dashboard_alias(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $response = $this->actingAs($student)->get(route('student.dashboard', absolute: false));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Dashboard')
            ->has('stats')
            ->has('communityScorePercent')
        );
    }

    public function test_non_student_cannot_access_student_dashboard_alias(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher)
            ->get('/student/dashboard')
            ->assertForbidden();
    }

    public function test_student_with_school_sees_school_and_active_challenges_on_dashboard(): void
    {
        $school = User::factory()->create([
            'role' => 'school',
            'name' => 'مدرسة الاختبار',
        ]);
        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);
        $creator = User::factory()->create(['role' => 'teacher']);

        $challenge = Challenge::factory()->create([
            'created_by' => $creator->id,
            'school_id' => $school->id,
            'title' => 'تحدي الاختبار',
            'status' => 'active',
            'start_date' => now()->subDay(),
            'deadline' => now()->addDays(7),
        ]);

        $response = $this->actingAs($student)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Dashboard')
            ->where('stats.school.id', $school->id)
            ->where('stats.school.name', 'مدرسة الاختبار')
            ->has('stats.activeChallenges', 1)
            ->where('stats.activeChallenges.0.id', $challenge->id)
            ->where('stats.activeChallenges.0.title', 'تحدي الاختبار')
            ->where('stats.activeChallenges.0.has_submission', false)
        );
    }

    public function test_student_dashboard_marks_active_challenge_has_submission_when_present(): void
    {
        $school = User::factory()->create(['role' => 'school']);
        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);
        $creator = User::factory()->create(['role' => 'teacher']);

        $challenge = Challenge::factory()->create([
            'created_by' => $creator->id,
            'school_id' => $school->id,
            'status' => 'active',
            'start_date' => now()->subHour(),
            'deadline' => now()->addDays(14),
        ]);

        ChallengeSubmission::factory()->create([
            'challenge_id' => $challenge->id,
            'student_id' => $student->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($student)->get(route('student.dashboard', absolute: false));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('stats.activeChallenges', 1)
            ->where('stats.activeChallenges.0.id', $challenge->id)
            ->where('stats.activeChallenges.0.has_submission', true)
        );
    }

    public function test_student_dashboard_includes_unread_project_evaluated_notifications(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $project = Project::factory()->create([
            'user_id' => $student->id,
            'title' => 'مشروع الإشعارات',
            'status' => 'approved',
        ]);

        $submission = ProjectSubmission::factory()->create([
            'project_id' => $project->id,
            'student_id' => $student->id,
            'status' => 'approved',
            'rating' => 4.5,
            'submitted_at' => now(),
        ]);

        $submission->load('project');
        $student->notify(new ProjectEvaluatedNotification($submission));

        $response = $this->actingAs($student)->get('/dashboard');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('stats.notifications', 1)
            ->where('stats.notifications.0.project_title', 'مشروع الإشعارات')
            ->where('stats.notifications.0.rating', fn ($r) => (float) $r === 4.5)
            ->where('stats.unreadCount', fn ($c) => $c >= 1)
        );
    }
}
