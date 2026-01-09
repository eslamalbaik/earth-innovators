<?php

namespace App\Notifications;

use App\Models\ProjectSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ProjectEvaluatedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $submission;

    public function __construct(ProjectSubmission $submission)
    {
        $this->submission = $submission;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'project_evaluated',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    // Laravel يستخدم تلقائياً PrivateChannel للمستخدم عند استخدام Notifications مع Broadcasting
    // لا حاجة لتحديد broadcastOn يدوياً - Laravel يقوم بذلك تلقائياً

    public function toArray(object $notifiable): array
    {
        $statusText = match($this->submission->status) {
            'approved' => 'تم قبول',
            'rejected' => 'تم رفض',
            'reviewed' => 'تم مراجعة',
            default => 'تم تقييم'
        };

        return [
            'type' => 'project_evaluated',
            'submission_id' => $this->submission->id,
            'project_id' => $this->submission->project_id,
            'project_title' => $this->submission->project->title,
            'rating' => $this->submission->rating,
            'status' => $this->submission->status,
            'title' => 'تم تقييم مشروعك',
            'message' => $statusText . ' مشروعك "' . $this->submission->project->title . '" من قبل الإدارة',
            'message_ar' => $statusText . ' مشروعك "' . $this->submission->project->title . '" من قبل الإدارة',
            'action_url' => '/student/projects/' . $this->submission->project_id,
        ];
    }
}
