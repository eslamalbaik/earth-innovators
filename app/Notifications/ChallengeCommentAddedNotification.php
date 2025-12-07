<?php

namespace App\Notifications;

use App\Models\ChallengeSubmissionComment;
use App\Models\ChallengeSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ChallengeCommentAddedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    protected ChallengeSubmissionComment $comment;
    protected ChallengeSubmission $submission;

    public function __construct(ChallengeSubmissionComment $comment, ChallengeSubmission $submission)
    {
        $this->comment = $comment->load(['user']);
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
            'type' => 'challenge_comment_added',
            'data' => $this->toArray($notifiable),
            'read_at' => null,
            'created_at' => now()->toIso8601String(),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $challenge = $this->submission->challenge;
        $student = $this->submission->student;
        $author = $this->comment->user;
        $commentText = mb_substr($this->comment->comment, 0, 100) . (mb_strlen($this->comment->comment) > 100 ? '...' : '');
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'student' => "/student/challenges/{$challenge->id}",
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/student/challenges/{$challenge->id}",
        };
        
        return (new MailMessage)
            ->subject('تعليق جديد على التسليم')
            ->line("{$author->name} أضاف تعليقًا على تسليم {$student->name}: \"{$commentText}\"")
            ->action('عرض التعليق', url($viewUrl))
            ->line('شكراً لاستخدامك منصة إرث المبتكرين!');
    }

    public function toArray(object $notifiable): array
    {
        $challenge = $this->submission->challenge;
        $student = $this->submission->student;
        $author = $this->comment->user;
        $commentText = mb_substr($this->comment->comment, 0, 200);
        
        // تحديد route بناءً على role المستخدم
        $viewUrl = match($notifiable->role ?? '') {
            'student' => "/student/challenges/{$challenge->id}",
            'teacher' => "/teacher/challenge-submissions/{$this->submission->id}",
            'school' => "/school/challenge-submissions/{$this->submission->id}",
            default => "/student/challenges/{$challenge->id}",
        };
        
        return [
            'type' => 'challenge_comment_added',
            'title' => 'تعليق جديد على التسليم',
            'body' => "{$author->name} أضاف تعليقًا على تسليم {$student->name}: \"{$commentText}\"",
            'comment_id' => $this->comment->id,
            'submission_id' => $this->submission->id,
            'challenge_id' => $challenge->id,
            'challenge_title' => $challenge->title,
            'student_id' => $student->id,
            'student_name' => $student->name,
            'author_id' => $author->id,
            'author_name' => $author->name,
            'comment_text' => $this->comment->comment,
            'meta' => [
                'relatedType' => 'comment',
                'relatedId' => $this->comment->id,
                'challengeId' => $challenge->id,
                'submissionId' => $this->submission->id,
                'timestamp' => now()->toIso8601String(),
                'priority' => 'low',
            ],
            'actions' => [
                [
                    'type' => 'view_comments',
                    'label' => 'عرض التعليقات',
                    'url' => $viewUrl,
                ],
            ],
        ];
    }
}
