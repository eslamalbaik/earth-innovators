<?php

namespace App\Events;

use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EvaluationDeleted
{
    use Dispatchable, SerializesModels;

    public int $evaluationId;
    public ChallengeSubmission $submission;

    /**
     * Create a new event instance.
     */
    public function __construct(int $evaluationId, ChallengeSubmission $submission)
    {
        $this->evaluationId = $evaluationId;
        $this->submission = $submission;
    }
}
