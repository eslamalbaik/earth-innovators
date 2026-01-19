<?php

namespace Database\Factories;

use App\Models\ProjectSubmission;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProjectSubmissionFactory extends Factory
{
    protected $model = ProjectSubmission::class;

    public function definition(): array
    {
        return [
            'project_id' => Project::factory(),
            'student_id' => User::factory(),
            'status' => 'submitted',
            'rating' => null,
            'feedback' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }
}

