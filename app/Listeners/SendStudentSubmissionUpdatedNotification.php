<?php

namespace App\Listeners;

use App\Events\StudentSubmissionUpdated;
use App\Notifications\StudentSubmissionUpdatedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class SendStudentSubmissionUpdatedNotification implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(StudentSubmissionUpdated $event): void
    {
        $submission = $event->submission;
        $submission->load(['project.teacher.user', 'project.school']);
        $project = $submission->project;
        
        // إرسال إشعار للمعلم إذا كان المشروع من معلم
        if ($project->teacher_id && $project->teacher && $project->teacher->user) {
            $project->teacher->user->notify(new StudentSubmissionUpdatedNotification($submission));
        }
        
        // إرسال إشعار للمدرسة إذا كان المشروع مرتبط بمدرسة
        if ($project->school_id && $project->school && $project->school->role === 'school') {
            $project->school->notify(new StudentSubmissionUpdatedNotification($submission));
        }
    }
}
