<?php

namespace Database\Factories;

use App\Models\ChallengeSubmission;
use App\Models\Challenge;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ChallengeSubmissionFactory extends Factory
{
    protected $model = ChallengeSubmission::class;

    public function definition(): array
    {
        return [
            'challenge_id' => Challenge::factory(),
            'student_id' => User::factory(),
            'status' => 'submitted',
            'rating' => null,
            'points_earned' => 0,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }
}

