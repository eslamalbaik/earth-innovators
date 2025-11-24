<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Badge;
use App\Services\StudentService;
use App\Repositories\UserRepository;
use App\Repositories\ProjectRepository;
use App\Repositories\BadgeRepository;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentServiceTest extends TestCase
{
    use RefreshDatabase;

    private StudentService $studentService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->studentService = app(StudentService::class);
    }

    public function test_can_get_students_by_school(): void
    {
        $school = User::factory()->create(['role' => 'school']);
        $students = User::factory()->count(5)->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);

        $result = $this->studentService->getStudentsBySchool($school->id);

        $this->assertCount(5, $result->items());
        $this->assertEquals($school->id, $result->first()->school_id);
    }

    public function test_can_award_badge_to_student(): void
    {
        $school = User::factory()->create(['role' => 'school']);
        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);
        $badge = Badge::factory()->create();

        $this->studentService->awardBadge($student->id, $school->id, $badge->id, 'Test reason');

        $this->assertDatabaseHas('user_badges', [
            'user_id' => $student->id,
            'badge_id' => $badge->id,
        ]);
    }
}

