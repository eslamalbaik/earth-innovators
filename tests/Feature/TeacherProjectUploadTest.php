<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TeacherProjectUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_teacher_can_create_project_for_educational_institution(): void
    {
        Storage::fake('public');

        $institution = User::factory()->create([
            'role' => 'educational_institution',
            'membership_type' => 'basic',
        ]);

        $teacherUser = User::factory()->create([
            'role' => 'teacher',
            'school_id' => $institution->id,
            'membership_type' => 'basic',
        ]);

        Teacher::factory()->create([
            'user_id' => $teacherUser->id,
        ]);

        $response = $this
            ->actingAs($teacherUser)
            ->post('/teacher/projects', [
                'title' => 'Innovation Project',
                'description' => 'A project submitted by a teacher.',
                'category' => 'science',
                'school_id' => $institution->id,
                'thumbnail' => UploadedFile::fake()->image('cover.jpg')->size(200),
            ]);

        $response->assertRedirect(route('teacher.projects.index'));

        $project = Project::query()->firstOrFail();

        $this->assertSame($teacherUser->id, $project->user_id);
        $this->assertSame($institution->id, $project->school_id);
        $this->assertSame('pending', $project->status);
        Storage::disk('public')->assertExists($project->thumbnail);
    }

    public function test_teacher_project_upload_creates_missing_teacher_profile(): void
    {
        Storage::fake('public');

        $school = User::factory()->create([
            'role' => 'school',
            'membership_type' => 'basic',
        ]);

        $teacherUser = User::factory()->create([
            'role' => 'teacher',
            'school_id' => $school->id,
            'membership_type' => 'basic',
        ]);

        $this
            ->actingAs($teacherUser)
            ->post('/teacher/projects', [
                'title' => 'Recovered Teacher Profile Project',
                'description' => 'A project submitted by a teacher without an existing teacher profile.',
                'category' => 'technology',
                'school_id' => $school->id,
                'thumbnail' => UploadedFile::fake()->image('cover.jpg')->size(200),
            ])
            ->assertRedirect(route('teacher.projects.index'));

        $this->assertDatabaseHas('teachers', [
            'user_id' => $teacherUser->id,
        ]);

        $this->assertDatabaseHas('projects', [
            'user_id' => $teacherUser->id,
            'school_id' => $school->id,
            'status' => 'pending',
        ]);
    }
}
