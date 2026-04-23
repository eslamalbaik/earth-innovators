<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Publication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProtectedPagesSmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_core_pages_render_successfully(): void
    {
        $student = User::factory()->create(['role' => 'student']);

        $this->actingAs($student)->get('/dashboard')->assertOk();
        $this->actingAs($student)->get('/student/projects')->assertOk();
        $this->actingAs($student)->get('/student/projects/create')->assertOk();
    }

    public function test_teacher_core_pages_render_successfully(): void
    {
        $teacher = User::factory()->create(['role' => 'teacher']);

        $this->actingAs($teacher)->get('/teacher/dashboard')->assertOk();
        $this->actingAs($teacher)->get('/teacher/publications')->assertOk();
        $this->actingAs($teacher)->get('/teacher/publications/create')->assertOk();
        $this->actingAs($teacher)->get('/teacher/certificates')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Teacher/Certificates/Index')
                ->has('certificateSystemHealth')
                ->has('membershipSummary')
            );
    }

    public function test_school_core_pages_render_successfully(): void
    {
        $school = User::factory()->create(['role' => 'school']);
        Publication::factory()->create([
            'school_id' => $school->id,
            'author_id' => $school->id,
            'status' => 'pending',
        ]);

        $this->actingAs($school)->get('/school/dashboard')->assertOk();
        $this->actingAs($school)->get('/school/publications')->assertOk();
        $this->actingAs($school)->get('/school/publications/create')->assertOk();
        $this->actingAs($school)->get('/school/publications/pending')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('School/Publications/Pending')
                ->has('publications.data', 1)
            );
        $this->actingAs($school)->get('/school/certificates')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('School/Certificates/Index')
                ->has('certificateSystemHealth')
                ->has('membershipSummary')
            );
    }

    public function test_admin_core_pages_render_successfully(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/users')->assertOk();
        $this->actingAs($admin)->get('/admin/challenges/create')->assertOk();
        $this->actingAs($admin)->get('/admin/publications')->assertOk();
        $this->actingAs($admin)->get('/admin/certificates')->assertOk();
    }
}
