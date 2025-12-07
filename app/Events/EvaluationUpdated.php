<?php

namespace App\Events;

use App\Models\ChallengeEvaluation;
use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EvaluationUpdated
{
    use Dispatchable, SerializesModels;

    public ChallengeEvaluation $evaluation;
    public ChallengeSubmission $submission;
    public array $changes;

    /**
     * Create a new event instance.
     */
    public function __construct(ChallengeEvaluation $evaluation, ChallengeSubmission $submission, array $changes = [])
    {
        $this->evaluation = $evaluation;
        $this->submission = $submission;
        $this->changes = $changes;
    }
}
