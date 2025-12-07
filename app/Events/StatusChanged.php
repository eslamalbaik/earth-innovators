<?php

namespace App\Events;

use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StatusChanged
{
    use Dispatchable, SerializesModels;

    public ChallengeSubmission $submission;
    public string $oldStatus;
    public string $newStatus;
    public int $initiatorId;

    /**
     * Create a new event instance.
     */
    public function __construct(ChallengeSubmission $submission, string $oldStatus, string $newStatus, int $initiatorId)
    {
        $this->submission = $submission;
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
        $this->initiatorId = $initiatorId;
    }
}
