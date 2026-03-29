<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentSubmissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_view_submissions_index(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $owner = User::factory()->create(['role' => 'teacher']);
        $project = Project::factory()->create([
            'user_id' => $owner->id,
            'status' => 'approved',
        ]);

        ProjectSubmission::factory()->create([
            'project_id' => $project->id,
            'student_id' => $student->id,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($student)->get('/student/submissions');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Student/Submissions/Index')
            ->where('filterStatus', 'all')
            ->has('submissions.data', 1)
        );
    }

    public function test_student_submissions_index_respects_status_filter(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $owner = User::factory()->create(['role' => 'teacher']);
        $projectA = Project::factory()->create([
            'user_id' => $owner->id,
            'status' => 'approved',
        ]);
        $projectB = Project::factory()->create([
            'user_id' => $owner->id,
            'status' => 'approved',
        ]);

        ProjectSubmission::factory()->create([
            'project_id' => $projectA->id,
            'student_id' => $student->id,
            'status' => 'approved',
            'submitted_at' => now(),
        ]);
        ProjectSubmission::factory()->create([
            'project_id' => $projectB->id,
            'student_id' => $student->id,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($student)->get('/student/submissions?status=submitted');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('submissions.data', 1)
            ->where('filterStatus', 'submitted')
        );
    }

    public function test_non_student_cannot_access_student_submissions_index(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher)
            ->get('/student/submissions')
            ->assertForbidden();
    }

    public function test_guest_is_redirected_from_student_submissions(): void
    {
        $this->get('/student/submissions')->assertRedirect();
    }
}
