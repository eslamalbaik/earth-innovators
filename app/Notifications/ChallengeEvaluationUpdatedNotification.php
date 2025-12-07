<?php

namespace App\Notifications;

use App\Models\ChallengeEvaluation;
use App\Models\ChallengeSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChallengeEvaluationUpdatedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected ChallengeEvaluation $evaluation;
    protected ChallengeSubmission $submission;

    public function __construct(ChallengeEvaluation $evaluation, ChallengeSubmission $submission)
    {
        $this->evaluation = $evaluation->load(['evaluator']);
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
            'type' => 'challenge_evaluation_updated',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $challenge = $this->submission->challenge;
        $student = $this->submission->student;
        $score = $this->evaluation->score !== null ? $this->evaluation->score : 'غير محدد';
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'student' => "/student/challenges/{$challenge->id}",
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/student/challenges/{$challenge->id}",
        };
        
        return (new MailMessage)
            ->subject('تحديث في تقييم التسليم')
            ->line("تحديث في تقييم تسليم {$student->name} للتحدي '{$challenge->title}'. التقييم الآن: {$score}.")
            ->action('عرض التقييم', url($viewUrl))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $challenge = $this->submission->challenge;
        $student = $this->submission->student;
        $score = $this->evaluation->score !== null ? $this->evaluation->score : 'غير محدد';
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'student' => "/student/challenges/{$challenge->id}",
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/student/challenges/{$challenge->id}",
        };
        
        return [
            'type' => 'challenge_evaluation_updated',
            'title' => 'تحديث في تقييم التسليم',
            'body' => "تحديث في تقييم تسليم {$student->name} للتحدي '{$challenge->title}'. التقييم الآن: {$score}.",
            'evaluation_id' => $this->evaluation->id,
            'submission_id' => $this->submission->id,
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
            'student_id' => $student->id,
            'student_name' => $student->name,
            'score' => $this->evaluation->score,
            'meta' => [
                'relatedType' => 'evaluation',
                'relatedId' => $this->evaluation->id,
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
