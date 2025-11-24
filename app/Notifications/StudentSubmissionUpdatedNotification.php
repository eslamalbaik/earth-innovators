<?php

namespace App\Notifications;

use App\Models\ProjectSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StudentSubmissionUpdatedNotification extends Notification
{
    use Queueable;

    protected $submission;

    public function __construct(ProjectSubmission $submission)
    {
        $this->submission = $submission;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $project = $this->submission->project;
        $student = $this->submission->student;
        
        return [
            'type' => 'student_submission_updated',
            'submission_id' => $this->submission->id,
            'project_id' => $project->id,
            'project_title' => $project->title,
            'student_name' => $student->name ?? 'طالب',
            'status' => $this->submission->status,
            'message' => 'تم تحديث تسليم مشروع: ' . $project->title,
            'message_ar' => 'تم تحديث تسليم مشروع: ' . $project->title . ' من الطالب: ' . ($student->name ?? 'طالب'),
            'action_url' => $notifiable->role === 'teacher' 
                ? '/teacher/submissions/' . $this->submission->id
                : '/school/submissions/' . $this->submission->id,
        ];
    }
}
