<?php

namespace App\Events;

use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChallengeSubmissionReviewed
{
    use Dispatchable, SerializesModels;

    public ChallengeSubmission $submission;
    public int $reviewedBy;

    /**
     * Create a new event instance.
     */
    public function __construct(ChallengeSubmission $submission, int $reviewedBy)
    {
        $this->submission = $submission;
        $this->reviewedBy = $reviewedBy;
    }
}

