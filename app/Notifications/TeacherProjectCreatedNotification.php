<?php

namespace App\Notifications;

use App\Models\Project;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

class TeacherProjectCreatedNotification extends Notification implements ShouldBroadcast
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
            'type' => 'teacher_project_created',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toArray(object $notifiable): array
    {
        // تحديث المشروع من قاعدة البيانات
        $this->project->refresh();
        
        // تحميل العلاقات بشكل آمن
        try {
            if ($this->project->teacher_id) {
                $this->project->load('teacher.user');
            }
        } catch (\Exception $e) {
            // تجاهل الأخطاء في تحميل العلاقات
        }
        
        $teacherName = 'معلم';
        if ($this->project->teacher && $this->project->teacher->user) {
            $teacherName = $this->project->teacher->user->name;
        } elseif ($this->project->user) {
            $teacherName = $this->project->user->name;
        }
        
        return [
            'type' => 'teacher_project_created',
            'project_id' => $this->project->id,
            'project_title' => $this->project->title,
            'teacher_name' => $teacherName,
            'message' => 'تم إضافة مشروع جديد من المعلم: ' . $this->project->title,
            'message_ar' => 'تم إضافة مشروع جديد من المعلم ' . $teacherName . ': ' . $this->project->title,
            'action_url' => '/school/projects/pending',
        ];
    }
}
