<?php

namespace Tests\Feature;

use App\Models\User;
use App\Http\Middleware\EnsureMembershipActive;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeacherStudentRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_student_get_route_redirects_to_students_index_instead_of_405(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'school_id' => null,
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'teacher_id' => $teacher->id,
            'school_id' => null,
        ]);

        $response = $this->actingAs($teacher)->get("/teacher/students/{$student->id}");

        $response->assertRedirect(route('teacher.students.index'));
    }

    public function test_teacher_cannot_open_another_teachers_student_fallback_route(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'school_id' => null,
        ]);

        $otherTeacher = User::factory()->create([
            'role' => 'teacher',
            'school_id' => null,
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'teacher_id' => $otherTeacher->id,
            'school_id' => null,
        ]);

        $response = $this->actingAs($teacher)->get("/teacher/students/{$student->id}");

        $response->assertRedirect('/');
    }

    public function test_teacher_student_year_must_be_numeric_when_creating_student(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'school_id' => null,
        ]);

        $response = $this->actingAs($teacher)->from('/teacher/students')->post('/teacher/students', [
            'name' => 'Demo Student',
            'email' => 'demo-student@example.com',
            'phone' => '+971500000000',
            'password' => 'password',
            'year' => 'not a number',
        ]);

        $response->assertRedirect('/teacher/students');
        $response->assertSessionHasErrors('year');
    }

    public function test_teacher_can_create_student_with_numeric_year(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'school_id' => null,
        ]);

        $response = $this->actingAs($teacher)->from('/teacher/students')->post('/teacher/students', [
            'name' => 'Demo Student',
            'email' => 'demo-student@example.com',
            'phone' => '+971500000000',
            'password' => 'password',
            'year' => 2026,
        ]);

        $response->assertRedirect('/teacher/students');
        $this->assertDatabaseHas('users', [
            'email' => 'demo-student@example.com',
            'role' => 'student',
            'teacher_id' => $teacher->id,
            'year' => 2026,
        ]);
    }
}
