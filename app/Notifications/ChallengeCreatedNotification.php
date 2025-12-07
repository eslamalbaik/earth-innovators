<?php

namespace App\Notifications;

use App\Models\Challenge;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChallengeCreatedNotification extends Notification implements ShouldBroadcast
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
            'type' => 'challenge_created',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $creatorName = $this->challenge->creator->name ?? 'مستخدم';
        
        return (new MailMessage)
            ->subject('تم إنشاء تحدٍ جديد')
            ->line("تم إنشاء تحدٍ جديد: {$this->challenge->title}")
            ->line("المنشئ: {$creatorName}")
            ->action('عرض التحدي', url("/school/challenges/{$this->challenge->id}"))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $creatorName = $this->challenge->creator->name ?? 'مستخدم';
        $statusText = $this->getStatusText($this->challenge->status);
        
        return [
            'type' => 'challenge_created',
            'title' => 'تم إنشاء تحدٍ جديد',
            'body' => "تم إنشاء تحدٍ جديد: {$this->challenge->title} - الحالة: {$statusText}",
            'challenge_id' => $this->challenge->id,
            'challenge_title' => $this->challenge->title,
            'challenge_status' => $this->challenge->status,
            'status_text' => $statusText,
            'creator_name' => $creatorName,
            'school_id' => $this->challenge->school_id,
            'action_url' => "/school/challenges/{$this->challenge->id}",
            'meta' => [
                'relatedType' => 'challenge',
                'relatedId' => $this->challenge->id,
                'timestamp' => now()->toIso8601String(),
                'priority' => 'medium',
            ],
            'actions' => [
                [
                    'type' => 'view_challenge',
                    'label' => 'عرض التحدي',
                    'url' => "/school/challenges/{$this->challenge->id}",
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

