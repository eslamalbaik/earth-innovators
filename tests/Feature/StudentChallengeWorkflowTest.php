<?php

namespace Tests\Feature;

use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentChallengeWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_submit_challenge_with_file_only(): void
    {
        Storage::fake('public');

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);

        $challenge = Challenge::factory()->create([
            'school_id' => $school->id,
            'status' => 'active',
            'start_date' => now()->subDay(),
            'deadline' => now()->addDay(),
        ]);

        $response = $this
            ->actingAs($student)
            ->post(route('student.challenges.submit', $challenge), [
                'answer' => '',
                'comment' => 'File only submission',
                'files' => [
                    UploadedFile::fake()->create('solution.pdf', 120, 'application/pdf'),
                ],
            ]);

        $submission = ChallengeSubmission::first();

        $response->assertRedirect(route('student.challenges.submissions.show', [$challenge, $submission]));
        $this->assertNotNull($submission);
        $this->assertSame($student->id, $submission->student_id);
        $this->assertNull($submission->answer);
        $this->assertCount(1, $submission->files ?? []);
        Storage::disk('public')->assertExists($submission->files[0]);
    }

    public function test_student_challenge_show_exposes_existing_submission_file_urls(): void
    {
        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);

        $challenge = Challenge::factory()->create([
            'school_id' => $school->id,
            'status' => 'active',
        ]);

        ChallengeSubmission::factory()->create([
            'challenge_id' => $challenge->id,
            'student_id' => $student->id,
            'files' => ['challenge-submissions/work/demo.pdf'],
        ]);

        $this
            ->actingAs($student)
            ->get(route('student.challenges.show', $challenge))
            ->assertInertia(fn ($page) => $page
                ->component('Student/Challenges/Show')
                ->where('challenge.student_submission.file_urls.0', '/storage/challenge-submissions/work/demo.pdf')
            );
    }
}
