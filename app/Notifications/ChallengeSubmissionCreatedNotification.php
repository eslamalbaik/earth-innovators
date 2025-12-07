<?php

namespace App\Notifications;

use App\Models\ChallengeSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChallengeSubmissionCreatedNotification extends Notification implements ShouldBroadcast
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
            'type' => 'challenge_submission_created',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $challenge = $this->submission->challenge;
        $student = $this->submission->student;
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/school/challenge-submissions/{$this->submission->id}",
        };
        
        return (new MailMessage)
            ->subject('تسليم جديد للتحدي')
            ->line("تم استلام تحدي جديد من {$student->name} للتحدي '{$challenge->title}'.")
            ->action('عرض التسليم', url($viewUrl))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $challenge = $this->submission->challenge;
        $student = $this->submission->student;
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/school/challenge-submissions/{$this->submission->id}",
        };
        
        return [
            'type' => 'challenge_submission_created',
            'title' => 'تسليم جديد للتحدي',
            'body' => "تم استلام تحدي جديد من {$student->name} للتحدي '{$challenge->title}'.",
            'submission_id' => $this->submission->id,
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
            'student_id' => $student->id,
            'student_name' => $student->name,
            'meta' => [
                'relatedType' => 'submission',
                'relatedId' => $this->submission->id,
                'challengeId' => $challenge->id,
                'submissionId' => $this->submission->id,
                'timestamp' => now()->toIso8601String(),
                'priority' => 'high',
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
