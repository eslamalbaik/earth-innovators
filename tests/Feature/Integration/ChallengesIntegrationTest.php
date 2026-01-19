<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Models\Point;
use App\Services\ChallengeSubmissionService;
use App\Services\PointsService;
use App\Events\ChallengeSubmissionReviewed;
use App\Events\CertificateIssued;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

class ChallengesIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected ChallengeSubmissionService $challengeSubmissionService;
    protected PointsService $pointsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->challengeSubmissionService = $this->app->make(ChallengeSubmissionService::class);
        $this->pointsService = $this->app->make(PointsService::class);
    }

    /** @test */
    public function challenge_evaluation_awards_points()
    {
        Event::fake();

        $student = User::factory()->create(['role' => 'student', 'points' => 0]);
        $teacher = User::factory()->create(['role' => 'teacher']);
        
        $challenge = Challenge::factory()->create([
            'points_reward' => 50,
        ]);

        $submission = ChallengeSubmission::factory()->create([
            'challenge_id' => $challenge->id,
            'student_id' => $student->id,
            'status' => 'submitted',
        ]);

        // Evaluate submission
        $this->challengeSubmissionService->evaluateSubmission(
            $submission,
            [
                'rating' => 4.0,
                'status' => 'approved',
                'points_earned' => 50,
                'reviewed_by' => $teacher->id,
            ]
        );

        $student->refresh();

        // Assert points were awarded
        $this->assertGreaterThan(0, $student->points);

        // Assert Point record was created
        $this->assertDatabaseHas('points', [
            'user_id' => $student->id,
            'source' => 'challenge',
        ]);

        // Assert ChallengeSubmissionReviewed event was fired
        Event::assertDispatched(ChallengeSubmissionReviewed::class);
    }

    /** @test */
    public function high_rating_grants_bonus_points_in_challenges()
    {
        $student = User::factory()->create(['role' => 'student', 'points' => 0]);
        $teacher = User::factory()->create(['role' => 'teacher']);
        
        $challenge = Challenge::factory()->create([
            'points_reward' => 50,
        ]);

        $submission = ChallengeSubmission::factory()->create([
            'challenge_id' => $challenge->id,
            'student_id' => $student->id,
            'status' => 'submitted',
        ]);

        // Evaluate with high rating (4.5)
        $this->challengeSubmissionService->evaluateSubmission(
            $submission,
            [
                'rating' => 4.5,
                'status' => 'approved',
                'points_earned' => 50,
                'reviewed_by' => $teacher->id,
            ]
        );

        $student->refresh();

        // Base: 50 + Bonus for 4.5: +5 = 55
        $this->assertGreaterThanOrEqual(55, $student->points);
    }
}
