<?php

namespace App\Notifications;

use App\Models\ChallengeEvaluation;
use App\Models\ChallengeSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChallengeEvaluationCreatedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected ChallengeEvaluation $evaluation;
    protected ChallengeSubmission $submission;

    public function __construct(ChallengeEvaluation $evaluation, ChallengeSubmission $submission)
    {
        $this->evaluation = $evaluation->load(['evaluator']);
        $this->submission = $submission->load(['challenge']);
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): array
    {
        return [
            'id' => $this->id,
            'type' => 'challenge_evaluation_created',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $challenge = $this->submission->challenge;
        $score = $this->evaluation->score !== null ? $this->evaluation->score : 'غير محدد';
        $feedback = $this->evaluation->feedback ?: 'لا يوجد تعليق';
        
        return (new MailMessage)
            ->subject('تم تقييم تسليمك للتحدي')
            ->line("تم تقييم تسليمك للتحدي '{$challenge->title}' — الدرجة: {$score}.")
            ->line("تعليق: {$feedback}")
            ->action('عرض التقييم', url("/student/challenges/{$challenge->id}"))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $challenge = $this->submission->challenge;
        $score = $this->evaluation->score !== null ? $this->evaluation->score : 'غير محدد';
        $feedback = $this->evaluation->feedback ?: 'لا يوجد تعليق';
        
        return [
            'type' => 'challenge_evaluation_created',
            'title' => 'تم تقييم تسليمك',
            'body' => "تم تقييم تسليمك للتحدي '{$challenge->title}' — الدرجة: {$score}. تعليق: {$feedback}",
            'evaluation_id' => $this->evaluation->id,
            'submission_id' => $this->submission->id,
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
            'score' => $this->evaluation->score,
            'feedback' => $this->evaluation->feedback,
            'meta' => [
                'relatedType' => 'evaluation',
                'relatedId' => $this->evaluation->id,
                'challengeId' => $challenge->id,
                'submissionId' => $this->submission->id,
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
}
