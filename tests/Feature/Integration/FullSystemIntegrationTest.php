<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Challenge;
use App\Models\ChallengeSubmission;
use App\Models\Publication;
use App\Models\Badge;
use App\Models\Point;
use App\Services\SubmissionService;
use App\Services\ChallengeSubmissionService;
use App\Services\PublicationService;
use App\Services\PointsService;
use App\Services\BadgeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;

/**
 * Full System Integration Test
 * 
 * Tests the complete integration flow:
 * Projects/Challenges/Publications Points Badges Certificates
 */
class FullSystemIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected SubmissionService $submissionService;
    protected ChallengeSubmissionService $challengeSubmissionService;
    protected PublicationService $publicationService;
    protected PointsService $pointsService;
    protected BadgeService $badgeService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->submissionService = $this->app->make(SubmissionService::class);
        $this->challengeSubmissionService = $this->app->make(ChallengeSubmissionService::class);
        $this->publicationService = $this->app->make(PublicationService::class);
        $this->pointsService = $this->app->make(PointsService::class);
        $this->badgeService = $this->app->make(BadgeService::class);
    }

    /** @test */
    public function complete_integration_flow_works_correctly()
    {
        Event::fake();

        // Create users
        $student = User::factory()->create([
            'role' => 'student',
            'points' => 0,
        ]);

        $teacherUser = User::factory()->create(['role' => 'teacher']);
        $teacher = \App\Models\Teacher::factory()->create(['user_id' => $teacherUser->id]);
        $admin = User::factory()->create(['role' => 'admin']);

        // Create community badge
        $communityBadge = Badge::factory()->create([
            'badge_category' => 'community',
            'points_required' => 100,
            'is_active' => true,
            'status' => 'approved',
        ]);

        // 1. Project submission and evaluation
        $project = Project::factory()->create([
            'user_id' => $student->id,
            'teacher_id' => $teacher->id,
        ]);
        $projectSubmission = ProjectSubmission::factory()->create([
            'project_id' => $project->id,
            'student_id' => $student->id,
            'status' => 'submitted',
        ]);
        
        $this->submissionService->evaluateSubmission(
            $projectSubmission,
            [
                'rating' => 4.5,
                'feedback' => 'Excellent!',
                'status' => 'approved',
            ],
            $teacherUser->id,
            $student->school_id,
            $teacher->id,
            false
        );

        $student->refresh();
        $projectPoints = $student->points;

        // 2. Challenge submission and evaluation
        $challenge = Challenge::factory()->create(['points_reward' => 50]);
        $challengeSubmission = ChallengeSubmission::factory()->create([
            'challenge_id' => $challenge->id,
            'student_id' => $student->id,
            'status' => 'submitted',
        ]);

        $this->challengeSubmissionService->evaluateSubmission(
            $challengeSubmission,
            [
                'rating' => 4.0,
                'status' => 'approved',
                'points_earned' => 50,
                'reviewed_by' => $teacherUser->id,
            ]
        );

        $student->refresh();
        $challengePoints = $student->points;

        // 3. Publication approval
        $publication = Publication::factory()->create([
            'author_id' => $student->id,
            'status' => 'pending',
        ]);

        $this->publicationService->approvePublication($publication, $admin->id);

        $student->refresh();
        $finalPoints = $student->points;

        // Assertions
        $this->assertGreaterThan(0, $projectPoints, 'Project should award points');
        $this->assertGreaterThan($projectPoints, $challengePoints, 'Challenge should add more points');
        $this->assertGreaterThan($challengePoints, $finalPoints, 'Publication should add more points');

        // Assert all events were fired
        Event::assertDispatched(\App\Events\ProjectEvaluated::class);
        Event::assertDispatched(\App\Events\ChallengeSubmissionReviewed::class);
        Event::assertDispatched(\App\Events\ArticleApproved::class);
        Event::assertDispatched(\App\Events\PointsAwarded::class, function ($event) {
            return $event->user->points > 0;
        });

        // If points reached 100, community badge should be awarded
        if ($finalPoints >= 100) {
            $this->assertTrue(
                $this->badgeService->userHasBadge($student->id, $communityBadge->id),
                'Community badge should be awarded when points reach threshold'
            );
        }
    }

    /** @test */
    public function points_lead_to_community_badges_automatically()
    {
        Event::fake();

        $student = User::factory()->create([
            'role' => 'student',
            'points' => 0,
        ]);

        // Create multiple community badges
        $badge50 = Badge::factory()->create([
            'badge_category' => 'community',
            'points_required' => 50,
            'is_active' => true,
            'status' => 'approved',
        ]);

        $badge100 = Badge::factory()->create([
            'badge_category' => 'community',
            'points_required' => 100,
            'is_active' => true,
            'status' => 'approved',
        ]);

        // Award 50 points
        $this->pointsService->awardPoints(
            $student->id,
            50,
            'test',
            null,
            'Test',
            'تجريبي'
        );

        $student->refresh();

        // Should have badge50
        $this->assertTrue($this->badgeService->userHasBadge($student->id, $badge50->id));
        $this->assertFalse($this->badgeService->userHasBadge($student->id, $badge100->id));

        // Award 50 more points
        $this->pointsService->awardPoints(
            $student->id,
            50,
            'test',
            null,
            'Test',
            'تجريبي'
        );

        $student->refresh();

        // Should have both badges
        $this->assertTrue($this->badgeService->userHasBadge($student->id, $badge50->id));
        $this->assertTrue($this->badgeService->userHasBadge($student->id, $badge100->id));
    }
}
