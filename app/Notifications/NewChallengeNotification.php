<?php

namespace App\Notifications;

use App\Models\Challenge;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewChallengeNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected Challenge $challenge;

    public function __construct(Challenge $challenge)
    {
        $this->challenge = $challenge->load(['creator', 'school']);
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'new_challenge',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $creatorName = $this->challenge->creator->name ?? 'المدرسة';
        
        return (new MailMessage)
            ->subject('تحدٍ جديد متاح')
            ->line("تم إضافة تحدٍ جديد: {$this->challenge->title}")
            ->line("المنشئ: {$creatorName}")
            ->action('عرض التحدي', url("/student/challenges/{$this->challenge->id}"))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $creatorName = $this->challenge->creator->name ?? 'المدرسة';
        $statusText = $this->getStatusText($this->challenge->status);
        
        return [
            'type' => 'new_challenge',
            'title' => 'تحدٍ جديد متاح',
            'body' => "تم إضافة تحدٍ جديد: {$this->challenge->title}",
            'message' => "تم إضافة تحدٍ جديد: {$this->challenge->title}",
            'message_ar' => "تم إضافة تحدٍ جديد: {$this->challenge->title}",
            'challenge_id' => $this->challenge->id,
            'challenge_title' => $this->challenge->title,
            'challenge_status' => $this->challenge->status,
            'status_text' => $statusText,
            'creator_name' => $creatorName,
            'school_id' => $this->challenge->school_id,
            'points_reward' => $this->challenge->points_reward ?? 0,
            'action_url' => "/student/challenges/{$this->challenge->id}",
            'meta' => [
                'relatedType' => 'challenge',
                'relatedId' => $this->challenge->id,
                'timestamp' => now()->toIso8601String(),
                'priority' => 'high',
            ],
            'actions' => [
                [
                    'type' => 'view_challenge',
                    'label' => 'عرض التحدي',
                    'url' => "/student/challenges/{$this->challenge->id}",
                ],
            ],
        ];
    }

    private function getStatusText(string $status): string
    {
        return match($status) {
            'draft' => 'مسودة',
            'active' => 'نشط',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي',
            default => $status,
        };
    }
}

