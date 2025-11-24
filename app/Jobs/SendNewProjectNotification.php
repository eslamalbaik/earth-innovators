<?php

namespace App\Jobs;

use App\Models\Project;
use App\Models\User;
use App\Notifications\NewProjectNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendNewProjectNotification
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    public function __construct(
        private Project $project
    ) {}

    public function handle(): void
    {
        try {
            $this->project->refresh();
            $this->project->load(['school']);

            // إرسال إشعار لجميع الطلاب والمعلمين في المدرسة
            if ($this->project->school_id) {
                $users = User::where('school_id', $this->project->school_id)
                    ->whereIn('role', ['student', 'teacher'])
                    ->get();

                foreach ($users as $user) {
                    $user->notify(new NewProjectNotification($this->project));
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to send new project notification: ' . $e->getMessage());
            throw $e;
        }
    }
}

