<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Badge;
use App\Models\User;
use App\Services\SubmissionService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_student_can_create_and_update_project_submission_with_files(): void
    {
        Storage::fake('public');

        $student = User::factory()->create(['role' => 'student']);
        $owner = User::factory()->create(['role' => 'teacher']);
        $project = Project::factory()->create([
            'user_id' => $owner->id,
            'status' => 'approved',
        ]);

        $submitResponse = $this->actingAs($student)->post("/projects/{$project->id}/submissions", [
            'comment' => 'first submission',
            'files' => [
                UploadedFile::fake()->create('initial-report.pdf', 300, 'application/pdf'),
            ],
        ]);

        $submitResponse->assertRedirect();
        $this->assertDatabaseHas('project_submissions', [
            'project_id' => $project->id,
            'student_id' => $student->id,
            'status' => 'submitted',
            'comment' => 'first submission',
        ]);

        $submission = ProjectSubmission::where('project_id', $project->id)
            ->where('student_id', $student->id)
            ->firstOrFail();

        $this->assertIsArray($submission->files);
        $this->assertNotEmpty($submission->files);
        Storage::disk('public')->assertExists($submission->files[0]);

        $updateResponse = $this->actingAs($student)->post("/project-submissions/{$submission->id}", [
            'comment' => 'updated submission',
            'files' => [
                UploadedFile::fake()->image('updated-image.jpg'),
            ],
        ]);

        $updateResponse->assertRedirect();

        $submission->refresh();
        $this->assertSame('updated submission', $submission->comment);
        $this->assertIsArray($submission->files);
        $this->assertNotEmpty($submission->files);
        Storage::disk('public')->assertExists($submission->files[0]);
    }

    public function test_submission_evaluation_awards_badges_and_updates_submission_status(): void
    {
        $student = User::factory()->create(['role' => 'student']);
        $reviewer = User::factory()->create(['role' => 'school']);
        $creator = User::factory()->create(['role' => 'admin']);
        $project = Project::factory()->create([
            'user_id' => $creator->id,
            'status' => 'approved',
        ]);
        $submission = ProjectSubmission::factory()->create([
            'project_id' => $project->id,
            'student_id' => $student->id,
            'status' => 'submitted',
        ]);
        $badge = Badge::factory()->create([
            'status' => 'approved',
            'is_active' => true,
            'created_by' => $creator->id,
        ]);

        /** @var SubmissionService $service */
        $service = app(SubmissionService::class);
        $service->evaluateSubmission($submission, [
            'rating' => 4.5,
            'feedback' => 'Great progress',
            'status' => 'approved',
            'badges' => [$badge->id],
        ], $reviewer->id, null, null, true);

        $submission->refresh();
        $this->assertSame('approved', $submission->status);
        $this->assertSame([$badge->id], $submission->badges);
        $this->assertNotNull($submission->reviewed_at);
        $this->assertDatabaseHas('user_badges', [
            'user_id' => $student->id,
            'badge_id' => $badge->id,
            'project_id' => $project->id,
        ]);
    }
}
