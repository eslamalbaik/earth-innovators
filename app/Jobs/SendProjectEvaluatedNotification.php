<?php

namespace App\Jobs;

use App\Models\ProjectSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendProjectEvaluatedNotification
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        private ProjectSubmission $submission
    ) {}

    public function handle(): void
    {
        try {
            $this->submission->refresh();
            $this->submission->load(['project', 'student']);
            
            if ($this->submission->student) {
                $this->submission->student->notify(
                    new \App\Notifications\ProjectEvaluatedNotification($this->submission)
                );
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send project evaluation notification: ' . $e->getMessage());
            throw $e;
        }
    }
}

