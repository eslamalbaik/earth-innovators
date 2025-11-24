<?php

namespace App\Notifications;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class BadgeAwardedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $badge;
    protected $awardedBy;

    /**
     * Create a new notification instance.
     */
    public function __construct(Badge $badge, User $awardedBy)
    {
        $this->badge = $badge;
        $this->awardedBy = $awardedBy;
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
            'type' => 'badge_awarded',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    // Laravel يستخدم تلقائياً PrivateChannel للمستخدم عند استخدام Notifications مع Broadcasting
    // لا حاجة لتحديد broadcastOn يدوياً - Laravel يقوم بذلك تلقائياً

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('تم منحك شارة جديدة')
                    ->line('تهانينا! لقد حصلت على شارة جديدة.')
                    ->line('الشارة: ' . ($this->badge->name_ar ?? $this->badge->name))
                    ->action('عرض الملف الشخصي', url('/profile'))
                    ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'badge_awarded',
            'title' => 'تم منحك شارة جديدة',
            'message' => 'لقد حصلت على شارة: ' . ($this->badge->name_ar ?? $this->badge->name),
            'badge_id' => $this->badge->id,
            'badge_name' => $this->badge->name_ar ?? $this->badge->name,
            'badge_icon' => $this->badge->icon,
            'awarded_by' => $this->awardedBy->name,
            'awarded_by_id' => $this->awardedBy->id,
        ];
    }
}

