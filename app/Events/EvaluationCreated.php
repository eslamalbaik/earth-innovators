<?php

namespace App\Events;

use App\Models\ChallengeEvaluation;
use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EvaluationCreated
{
    use Dispatchable, SerializesModels;

    public ChallengeEvaluation $evaluation;
    public ChallengeSubmission $submission;

    /**
     * Create a new event instance.
     */
    public function __construct(ChallengeEvaluation $evaluation, ChallengeSubmission $submission)
    {
        $this->evaluation = $evaluation;
        $this->submission = $submission;
    }
}
