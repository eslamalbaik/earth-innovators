<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureMembershipActive;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SchoolStudentRoutesTest extends TestCase
{
    use RefreshDatabase;

    public function test_school_student_get_route_redirects_to_students_index_instead_of_405(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);

        $response = $this->actingAs($school)->get("/school/students/{$student->id}");

        $response->assertRedirect(route('school.students.index'));
    }

    public function test_school_cannot_open_student_fallback_for_another_schools_student(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $otherSchool = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $otherSchool->id,
        ]);

        $response = $this->actingAs($school)->get("/school/students/{$student->id}");

        $response->assertRedirect('/');
    }

    public function test_action_only_get_requests_redirect_to_referer_instead_of_showing_405(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);

        $response = $this
            ->actingAs($school)
            ->withHeader('referer', url('/school/students'))
            ->get("/school/students/{$student->id}/badges/1");

        $response->assertRedirect('/school/students');
        $response->assertSessionHas('error', 'هذا الرابط مخصص لتنفيذ إجراء وليس صفحة مباشرة.');
    }

    public function test_school_award_badge_get_route_redirects_to_students_index_instead_of_405(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $school->id,
        ]);

        $response = $this->actingAs($school)->get("/school/students/{$student->id}/award-badge");

        $response->assertRedirect(route('school.students.index'));
    }

    public function test_school_cannot_open_award_badge_fallback_for_another_schools_student(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $otherSchool = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => $otherSchool->id,
        ]);

        $response = $this->actingAs($school)->get("/school/students/{$student->id}/award-badge");

        $response->assertRedirect('/');
    }

    public function test_school_student_year_must_be_numeric_when_creating_student(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $response = $this->actingAs($school)->from('/school/students')->post('/school/students', [
            'name' => 'Demo Student',
            'email' => 'school-demo-student@example.com',
            'phone' => '+971500000000',
            'password' => 'password',
            'year' => 'not a number',
        ]);

        $response->assertRedirect('/school/students');
        $response->assertSessionHasErrors('year');
    }

    public function test_school_can_create_student_with_numeric_year(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $response = $this->actingAs($school)->from('/school/students')->post('/school/students', [
            'name' => 'Demo Student',
            'email' => 'school-demo-student@example.com',
            'phone' => '+971500000000',
            'password' => 'password',
            'year' => 2026,
        ]);

        $response->assertRedirect(route('school.students.index'));
        $this->assertDatabaseHas('users', [
            'email' => 'school-demo-student@example.com',
            'role' => 'student',
            'school_id' => $school->id,
            'year' => 2026,
        ]);
    }

    public function test_school_can_attach_existing_unassigned_student(): void
    {
        $this->withoutMiddleware(EnsureMembershipActive::class);

        $school = User::factory()->create([
            'role' => 'school',
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'school_id' => null,
        ]);

        $response = $this->actingAs($school)->from('/school/students')->post('/school/students', [
            'existing_student_id' => $student->id,
        ]);

        $response->assertRedirect(route('school.students.index'));
        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'school_id' => $school->id,
        ]);
    }
}
