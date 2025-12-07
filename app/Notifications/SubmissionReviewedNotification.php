<?php

namespace App\Notifications;

use App\Models\ChallengeSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubmissionReviewedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected ChallengeSubmission $submission;

    public function __construct(ChallengeSubmission $submission)
    {
        $this->submission = $submission->load(['challenge', 'reviewer']);
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'submission_reviewed',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $challenge = $this->submission->challenge;
        $status = $this->getStatusText($this->submission->status);
        $feedback = $this->submission->feedback ?: 'لا يوجد تعليق';
        
        return (new MailMessage)
            ->subject('تم تقييم تسليمك للتحدي')
            ->line("تم تقييم تسليمك للتحدي '{$challenge->title}' — الحالة: {$status}.")
            ->line("تعليق: {$feedback}")
            ->action('عرض التقييم', url("/student/challenges/{$challenge->id}"))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $challenge = $this->submission->challenge;
        $status = $this->getStatusText($this->submission->status);
        $feedback = $this->submission->feedback ?: 'لا يوجد تعليق';
        $rating = $this->submission->rating !== null ? $this->submission->rating : null;
        
        return [
            'type' => 'submission_reviewed',
            'title' => 'تم تقييم تسليمك',
            'body' => "تم تقييم تسليمك للتحدي '{$challenge->title}' — الحالة: {$status}. تعليق: {$feedback}",
            'submission_id' => $this->submission->id,
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
            'status' => $this->submission->status,
            'status_text' => $status,
            'rating' => $rating,
            'feedback' => $this->submission->feedback,
            'points_earned' => $this->submission->points_earned,
            'reviewer_name' => $this->submission->reviewer->name ?? 'المدرسة',
            'meta' => [
                'relatedType' => 'submission',
                'relatedId' => $this->submission->id,
                'challengeId' => $challenge->id,
                'timestamp' => now()->toIso8601String(),
                'priority' => 'high',
            ],
            'actions' => [
                [
                    'type' => 'view_submission',
                    'label' => 'عرض التسليم',
                    'url' => "/student/challenges/{$challenge->id}",
                ],
            ],
        ];
    }

    private function getStatusText(string $status): string
    {
        return match($status) {
            'reviewed' => 'تم المراجعة',
            'approved' => 'مقبول',
            'rejected' => 'مرفوض',
            default => $status,
        };
    }
}

