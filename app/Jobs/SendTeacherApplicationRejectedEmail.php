<?php

namespace App\Jobs;

use App\Models\TeacherApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;

class SendTeacherApplicationRejectedEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 60;

    public function __construct(
        private TeacherApplication $application
    ) {}

    public function handle(): void
    {
        try {
            if ($this->application->user && $this->application->user->email) {
                Mail::to($this->application->user->email)
                    ->send(new \App\Mail\TeacherApplicationRejected($this->application));
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send teacher application rejected email: ' . $e->getMessage());
            throw $e;
        }
    }
}

