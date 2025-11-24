<?php

namespace App\Listeners;

use App\Events\ProjectApproved;
use App\Notifications\ProjectApprovedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendProjectApprovedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(ProjectApproved $event): void
    {
        $project = $event->project;
        $project->load('teacher.user');
        
        // إرسال إشعار للمعلم إذا كان المشروع من معلم
        if ($project->teacher_id && $project->teacher && $project->teacher->user) {
            $project->teacher->user->notify(new ProjectApprovedNotification($project));
        }
    }
}
