<?php

namespace App\Events;

use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubmissionCreated
{
    use Dispatchable, SerializesModels;

    public ChallengeSubmission $submission;
    public int $initiatorId;

    /**
     * Create a new event instance.
     */
    public function __construct(ChallengeSubmission $submission, int $initiatorId)
    {
        $this->submission = $submission;
        $this->initiatorId = $initiatorId;
    }
}
