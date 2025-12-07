<?php

namespace App\Events;

use App\Models\ChallengeSubmissionComment;
use App\Models\ChallengeSubmission;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentAdded
{
    use Dispatchable, SerializesModels;

    public ChallengeSubmissionComment $comment;
    public ChallengeSubmission $submission;

    /**
     * Create a new event instance.
     */
    public function __construct(ChallengeSubmissionComment $comment, ChallengeSubmission $submission)
    {
        $this->comment = $comment;
        $this->submission = $submission;
    }
}
