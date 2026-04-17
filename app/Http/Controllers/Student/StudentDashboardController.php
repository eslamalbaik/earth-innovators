<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\ActivityService;
use App\Services\DashboardService;
use App\Services\MembershipAccessService;
use App\Services\StudentEngagementService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Check if user is a student
        if (!$user || $user->role !== 'student') {
            abort(403, 'Unauthorized action.');
        }

        try {
            // Get optimized dashboard stats from service
            $dashboardService = app(DashboardService::class);
            $stats = $dashboardService->getStudentDashboardStats($user->id);

            // Get recent activities
            $activityService = app(ActivityService::class);
            $activities = $activityService->getStudentActivities($user->id, 5);

            // Get recent badges
            $recentBadges = $activityService->getRecentBadges($user->id, 3);

            // Get active challenges for student's school
            $activeChallenges = [];
            if ($user->school_id) {
                $challengeService = app(\App\Services\ChallengeSubmissionService::class);
                $challenges = $challengeService->getActiveChallengesForStudent($user->school_id, 2);

                // Load student submissions for each challenge
                $challengeIds = $challenges->pluck('id');
                $submissions = \App\Models\ChallengeSubmission::whereIn('challenge_id', $challengeIds)
                    ->where('student_id', $user->id)
                    ->get()
                    ->keyBy('challenge_id');

                // Attach submission status to each challenge
                $activeChallenges = $challenges->getCollection()->map(function ($challenge) use ($submissions) {
                    $challenge->has_submission = $submissions->has($challenge->id);
                    return $challenge;
                })->toArray();
            }
        } catch (\Exception $e) {
            // Align with DashboardService::getStudentDashboardStats keys + frontend (camelCase)
            $stats = [
                'totalPoints'    => (int) ($user->points ?? 0),
                'totalProjects'  => 0,
                'approvedProjects' => 0,
                'pendingProjects'  => 0,
                'rejectedProjects' => 0,
                'totalBadges'    => 0,
                'winningProjects' => 0,
                'recentProjects' => [],
                'submissions' => [
                    'total'         => 0,
                    'awaitingReview' => 0,
                    'reviewed'      => 0,
                    'approved'      => 0,
                    'rejected'      => 0,
                ],
                'certificates' => [
                    'approved'              => 0,
                    'pendingSchoolApproval' => 0,
                ],
            ];
            $activities      = collect([]);
            $recentBadges    = collect([]);
            $activeChallenges = [];
        }

        // Get school info
        $school = $user->school;

        // Get unread notifications
        $unreadNotifications = $user->unreadNotifications()
            ->where('type', 'App\Notifications\ProjectEvaluatedNotification')
            ->select('id', 'data', 'created_at', 'read_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($notification) {
                return [
                    'id'            => $notification->id,
                    'message'       => $notification->data['message_ar'] ?? $notification->data['message'] ?? 'تم تقييم مشروعك',
                    'project_title' => $notification->data['project_title'] ?? '',
                    'rating'        => $notification->data['rating'] ?? null,
                    'created_at'    => $notification->created_at->diffForHumans(),
                    'read_at'       => $notification->read_at,
                ];
            });

        $stats['activities']   = $activities;
        $stats['recentBadges'] = $recentBadges;
        $stats['notifications'] = $unreadNotifications;
        $stats['unreadCount']  = $user->unreadNotifications()->count();
        $stats['school']       = $school ? [
            'id'   => $school->id,
            'name' => $school->name,
        ] : null;
        $stats['activeChallenges'] = $activeChallenges;

        $engagement            = app(StudentEngagementService::class)->getSummary($user);
        $communityScorePercent = (int) ($engagement['engagement_score'] ?? 0);

        // Membership summary for trial/subscription banner
        $membershipSummary = app(MembershipAccessService::class)->getMembershipSummary($user);

        return Inertia::render('Student/Dashboard', [
            'stats'                => $stats,
            'communityScorePercent' => $communityScorePercent,
            'engagement'           => $engagement,
            'membershipSummary'    => $membershipSummary,
        ]);
    }
}
