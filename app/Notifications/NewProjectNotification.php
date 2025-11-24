<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewProjectNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $project;

    public function __construct(Project $project)
    {
        $this->project = $project;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'new_project',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    // Laravel يستخدم تلقائياً PrivateChannel للمستخدم عند استخدام Notifications مع Broadcasting
    // لا حاجة لتحديد broadcastOn يدوياً - Laravel يقوم بذلك تلقائياً

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('مشروع جديد في المنصة')
            ->line('تم إنشاء مشروع جديد: ' . $this->project->title)
            ->action('عرض المشروع', url('/projects/' . $this->project->id))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_project',
            'project_id' => $this->project->id,
            'project_title' => $this->project->title,
            'project_category' => $this->project->category,
            'school_id' => $this->project->school_id,
            'message' => 'تم إنشاء مشروع جديد: ' . $this->project->title,
            'message_ar' => 'تم إنشاء مشروع جديد: ' . $this->project->title,
            'action_url' => '/projects/' . $this->project->id,
        ];
    }
}

