<?php

namespace App\Notifications;

use App\Models\Publication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewPublicationNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected $publication;

    public function __construct(Publication $publication)
    {
        $this->publication = $publication;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'new_publication',
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
            ->subject('مقال جديد في مدرستك')
            ->line('تم نشر مقال جديد: ' . $this->publication->title)
            ->action('عرض المقال', url('/publications/' . $this->publication->id))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_publication',
            'publication_id' => $this->publication->id,
            'publication_title' => $this->publication->title,
            'publication_type' => $this->publication->type,
            'school_id' => $this->publication->school_id,
            'author_name' => $this->publication->author->name ?? 'غير معروف',
            'message' => 'تم نشر مقال جديد: ' . $this->publication->title,
            'message_ar' => 'تم نشر مقال جديد: ' . $this->publication->title,
            'action_url' => '/publications/' . $this->publication->id,
        ];
    }
}

