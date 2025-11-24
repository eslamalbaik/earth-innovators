<?php

namespace App\Jobs;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendTeacherApplicationApprovedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        private Teacher $teacher
    ) {}

    public function handle(): void
    {
        try {
            if ($this->teacher->user && $this->teacher->user->email) {
                Mail::to($this->teacher->user->email)
                    ->send(new \App\Mail\TeacherApplicationApproved($this->teacher));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send teacher application approved email: ' . $e->getMessage());
            throw $e;
        }
    }
}

