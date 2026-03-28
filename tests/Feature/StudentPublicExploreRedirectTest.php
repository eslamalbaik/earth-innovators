<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentPublicExploreRedirectTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_access_public_projects_index(): void
    {
        $this->get('/projects')->assertOk();
    }

    public function test_student_is_redirected_from_public_projects_to_student_projects(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->get('/projects')
            ->assertRedirect('/student/projects');
    }

    public function test_student_is_redirected_from_public_project_show(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->get('/projects/5')
            ->assertRedirect('/student/projects/5');
    }

    public function test_student_is_redirected_from_public_challenges(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->get('/challenges')
            ->assertRedirect('/student/challenges');
    }

    public function test_student_is_redirected_from_public_challenges_winners_to_student_winners(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)
            ->get('/challenges/winners')
            ->assertRedirect('/student/challenges/winners');
    }

    public function test_teacher_is_not_redirected_from_public_projects(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher)
            ->get('/projects')
            ->assertOk();
    }
}
