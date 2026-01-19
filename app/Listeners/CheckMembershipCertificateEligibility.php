<?php

namespace App\Listeners;

use App\Services\MembershipCertificateService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class CheckMembershipCertificateEligibility
{
    protected $membershipCertificateService;

    public function __construct(MembershipCertificateService $membershipCertificateService)
    {
        $this->membershipCertificateService = $membershipCertificateService;
    }

    /**
     * Handle the event - Check eligibility when points are awarded
     */
    public function handle($event)
    {
        try {
            $userId = null;
            $role = null;

            // Extract user ID and role from different event types
            if (isset($event->user)) {
                $userId = $event->user->id ?? $event->user;
                $role = $event->user->role ?? null;
            } elseif (isset($event->userId)) {
                $userId = $event->userId;
                $user = \App\Models\User::find($userId);
                $role = $user->role ?? null;
            } elseif (isset($event->student)) {
                $userId = $event->student->id ?? $event->student;
                $user = \App\Models\User::find($userId);
                $role = $user->role ?? null;
            } elseif (isset($event->submission)) {
                // Handle ProjectEvaluated and ChallengeSubmissionReviewed events
                $submission = $event->submission;
                $userId = $submission->student_id ?? ($submission->student ? $submission->student->id : null) ?? null;
                if ($userId) {
                    $user = \App\Models\User::find($userId);
                    $role = $user->role ?? null;
                }
            } elseif ($event instanceof \App\Events\PointsAwarded) {
                // Handle PointsAwarded event
                $userId = $event->user->id ?? null;
                $role = $event->user->role ?? null;
            } elseif ($event instanceof \App\Events\ArticleApproved) {
                // Handle ArticleApproved event
                $publication = $event->publication;
                $userId = $publication->author_id ?? null;
                if ($userId) {
                    $user = \App\Models\User::find($userId);
                    $role = $user->role ?? null;
                }
            }

            if (!$userId || !$role) {
                return;
            }

            // Check and award certificate based on role
            if ($role === 'student') {
                $this->membershipCertificateService->checkAndAwardStudentMembership($userId);
            } elseif ($role === 'teacher') {
                $this->membershipCertificateService->checkAndAwardTeacherMembership($userId);
            } elseif ($role === 'school') {
                $this->membershipCertificateService->checkAndAwardSchoolMembership($userId);
            }
        } catch (\Exception $e) {
            Log::error('Error checking membership certificate eligibility', [
                'event' => get_class($event),
                'error' => $e->getMessage(),
            ]);
        }
    }
}

