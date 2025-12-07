<?php

namespace App\Notifications;

use App\Models\ChallengeSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChallengeStatusChangedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected ChallengeSubmission $submission;
    protected string $oldStatus;
    protected string $newStatus;

    public function __construct(ChallengeSubmission $submission, string $oldStatus, string $newStatus)
    {
        $this->submission = $submission->load(['challenge', 'student']);
        $this->oldStatus = $oldStatus;
        $this->newStatus = $newStatus;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'challenge_status_changed',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $challenge = $this->submission->challenge;
        $statusLabels = [
            'submitted' => 'تم التسليم',
            'resubmitted' => 'تم إعادة التسليم',
            'reviewed' => 'تم المراجعة',
            'approved' => 'تم القبول',
            'rejected' => 'تم الرفض',
            'withdrawn' => 'تم السحب',
        ];
        $newStatusLabel = $statusLabels[$this->newStatus] ?? $this->newStatus;
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'student' => "/student/challenges/{$challenge->id}",
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/student/challenges/{$challenge->id}",
        };
        
        return (new MailMessage)
            ->subject('تغير حالة التسليم')
            ->line("تغير حالة التسليم لـ '{$challenge->title}' إلى '{$newStatusLabel}'.")
            ->action('عرض التسليم', url($viewUrl))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $challenge = $this->submission->challenge;
        $statusLabels = [
            'submitted' => 'تم التسليم',
            'resubmitted' => 'تم إعادة التسليم',
            'reviewed' => 'تم المراجعة',
            'approved' => 'تم القبول',
            'rejected' => 'تم الرفض',
            'withdrawn' => 'تم السحب',
        ];
        $newStatusLabel = $statusLabels[$this->newStatus] ?? $this->newStatus;
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'student' => "/student/challenges/{$challenge->id}",
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/student/challenges/{$challenge->id}",
        };
        
        return [
            'type' => 'challenge_status_changed',
            'title' => 'تغير حالة التسليم',
            'body' => "تغير حالة التسليم لـ '{$challenge->title}' إلى '{$newStatusLabel}'.",
            'submission_id' => $this->submission->id,
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'new_status_label' => $newStatusLabel,
            'meta' => [
                'relatedType' => 'submission',
                'relatedId' => $this->submission->id,
                'challengeId' => $challenge->id,
                'submissionId' => $this->submission->id,
                'timestamp' => now()->toIso8601String(),
                'priority' => 'medium',
            ],
            'actions' => [
                [
                    'type' => 'view_submission',
                    'label' => 'عرض التسليم',
                    'url' => $viewUrl,
                ],
            ],
        ];
    }
}
