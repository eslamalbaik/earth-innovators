<?php

namespace App\Events;

use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubmissionUpdated
{
    use Dispatchable, SerializesModels;

    public ChallengeSubmission $submission;
    public array $changes;
    public int $initiatorId;

    /**
     * Create a new event instance.
     */
    public function __construct(ChallengeSubmission $submission, array $changes, int $initiatorId)
    {
        $this->submission = $submission;
        $this->changes = $changes;
        $this->initiatorId = $initiatorId;
    }
}
