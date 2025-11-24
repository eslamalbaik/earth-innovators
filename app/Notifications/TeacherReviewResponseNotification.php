<?php

namespace App\Notifications;

use App\Models\Review;
use App\Models\Teacher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TeacherReviewResponseNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $review;
    protected $teacher;

    /**
     * Create a new notification instance.
     */
    public function __construct(Review $review, Teacher $teacher)
    {
        $this->review = $review;
        $this->teacher = $teacher;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'teacher_review_response',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $teacherName = $this->teacher->name_ar ?? $this->teacher->name_en ?? $this->teacher->user->name ?? 'المعلم';
        
        return (new MailMessage)
                    ->subject('رد المعلم على تقييمك')
                    ->line('قام المعلم ' . $teacherName . ' بالرد على تقييمك.')
                    ->line('الرد: ' . $this->review->teacher_response)
                    ->action('عرض التقييم', url('/student/reviews'))
                    ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $teacherName = $this->teacher->name_ar ?? $this->teacher->name_en ?? $this->teacher->user->name ?? 'المعلم';
        
        return [
            'type' => 'teacher_review_response',
            'title' => 'رد المعلم على تقييمك',
            'message' => 'قام ' . $teacherName . ' بالرد على تقييمك',
            'review_id' => $this->review->id,
            'teacher_id' => $this->teacher->id,
            'teacher_name' => $teacherName,
            'teacher_response' => $this->review->teacher_response,
            'action_url' => '/student/reviews',
        ];
    }
}

