<?php

namespace App\Notifications;

use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewTeacherApplication extends Notification implements ShouldQueue
{
    use Queueable;

    protected $teacher;

    public function __construct(Teacher $teacher)
    {
        $this->teacher = $teacher;
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('طلب انضمام معلم جديد - ' . ($this->teacher->name_ar ?? $this->teacher->name_en ?? $this->teacher->user->name ?? 'معلم جديد'))
            ->view('emails.new-teacher-application', [
                'teacher' => $this->teacher,
                'notifiable' => $notifiable,
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_teacher_application',
            'teacher_id' => $this->teacher->id,
            'teacher_name' => $this->teacher->name,
            'teacher_email' => $this->teacher->email,
            'teacher_city' => $this->teacher->city,
            'message' => 'طلب انضمام جديد من ' . $this->teacher->name,
            'action_url' => '/admin/teacher-applications',
        ];
    }
}