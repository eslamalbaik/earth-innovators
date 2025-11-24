<?php

namespace App\Listeners;

use App\Events\ProjectRejected;
use App\Notifications\ProjectRejectedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendProjectRejectedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(ProjectRejected $event): void
    {
        $project = $event->project;
        $project->load('teacher.user');
        
        // إرسال إشعار للمعلم إذا كان المشروع من معلم
        if ($project->teacher_id && $project->teacher && $project->teacher->user) {
            $project->teacher->user->notify(new ProjectRejectedNotification($project));
        }
    }
}
