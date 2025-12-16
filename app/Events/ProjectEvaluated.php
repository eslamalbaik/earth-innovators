<?php

namespace App\Events;

use App\Models\ProjectSubmission;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProjectEvaluated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ProjectSubmission $submission;

    /**
     * Create a new event instance.
     */
    public function __construct(ProjectSubmission $submission)
    {
        $this->submission = $submission;
    }
}
