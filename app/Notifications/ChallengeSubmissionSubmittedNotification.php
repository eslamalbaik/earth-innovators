<?php

namespace App\Notifications;

use App\Models\ChallengeSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChallengeSubmissionSubmittedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected ChallengeSubmission $submission;

    public function __construct(ChallengeSubmission $submission)
    {
        $this->submission = $submission->load(['challenge', 'student']);
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'challenge_submission_submitted',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $challenge = $this->submission->challenge;
        
        return (new MailMessage)
            ->subject('تم تسليم التحدي بنجاح')
            ->line("تم تسليم حل التحدي '{$challenge->title}' بنجاح.")
            ->line('سيتم مراجعة تسليمك قريباً.')
            ->action('عرض حالة التقديم', url("/student/challenges/{$challenge->id}/submissions/{$this->submission->id}"))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $challenge = $this->submission->challenge;
        
        return [
            'type' => 'challenge_submission_submitted',
            'title' => 'تم تسليم التحدي',
            'body' => "تم تسليم حل التحدي '{$challenge->title}' بنجاح. سيتم مراجعة تسليمك قريباً.",
            'message' => "تم تسليم حل التحدي '{$challenge->title}' بنجاح.",
            'message_ar' => "تم تسليم حل التحدي '{$challenge->title}' بنجاح.",
            'submission_id' => $this->submission->id,
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
            'status' => $this->submission->status,
            'status_text' => 'تم التقديم',
            'action_url' => "/student/challenges/{$challenge->id}/submissions/{$this->submission->id}",
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
                    'label' => 'عرض حالة التقديم',
                    'url' => "/student/challenges/{$challenge->id}/submissions/{$this->submission->id}",
                ],
            ],
        ];
    }
}

