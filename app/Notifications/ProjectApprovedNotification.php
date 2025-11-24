<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ProjectApprovedNotification extends Notification
{
    use Queueable;

    protected $project;

    public function __construct(Project $project)
    {
        $this->project = $project;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'project_approved',
            'project_id' => $this->project->id,
            'project_title' => $this->project->title,
            'message' => 'تم قبول مشروعك: ' . $this->project->title,
            'message_ar' => 'تم قبول مشروعك: ' . $this->project->title,
            'action_url' => '/teacher/projects/' . $this->project->id,
        ];
    }
}
