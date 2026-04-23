<?php

namespace Tests\Feature\Integration;

use Tests\TestCase;
use App\Models\User;
use App\Models\Publication;
use App\Models\Point;
use App\Services\PublicationService;
use App\Services\PointsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;

class PublicationsIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected PublicationService $publicationService;
    protected PointsService $pointsService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->publicationService = $this->app->make(PublicationService::class);
        $this->pointsService = $this->app->make(PointsService::class);
    }

    /** @test */
    public function publication_approval_awards_points()
    {
        Event::fake();

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'points' => 0,
        ]);

        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $publication = Publication::factory()->create([
            'author_id' => $teacher->id,
            'status' => 'pending',
        ]);

        // Approve publication
        $this->publicationService->approvePublication($publication, $admin->id);

        $teacher->refresh();

        // Assert 20 points were awarded
        $this->assertEquals(20, $teacher->points);

        // Assert Point record was created
        $this->assertDatabaseHas('points', [
            'user_id' => $teacher->id,
            'points' => 20,
            'source' => 'publication_approval',
        ]);

        // Assert ArticleApproved event was fired
        Event::assertDispatched(\App\Events\ArticleApproved::class);
    }

    /** @test */
    public function publication_approval_notifies_school_teachers_and_students()
    {
        Notification::fake();

        $school = User::factory()->create([
            'role' => 'school',
        ]);
        $teacherAuthor = User::factory()->create([
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);
        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);
        $teacherColleague = User::factory()->create([
            'role' => 'teacher',
            'school_id' => $school->id,
        ]);
        $outsideTeacher = User::factory()->create([
            'role' => 'teacher',
        ]);

        $publication = Publication::factory()->create([
            'author_id' => $teacherAuthor->id,
            'school_id' => $school->id,
            'status' => 'pending',
        ]);

        $this->publicationService->approvePublication($publication, $school->id);

        Notification::assertSentTo(
            [$student, $teacherAuthor, $teacherColleague],
            \App\Notifications\NewPublicationNotification::class
        );
        Notification::assertNotSentTo(
            [$school, $outsideTeacher],
            \App\Notifications\NewPublicationNotification::class
        );
    }
}
