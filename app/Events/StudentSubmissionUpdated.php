<?php

namespace App\Events;

use App\Models\ProjectSubmission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StudentSubmissionUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $submission;

    public function __construct(ProjectSubmission $submission)
    {
        $this->submission = $submission;
    }
}
