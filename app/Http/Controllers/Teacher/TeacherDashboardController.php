<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\ChallengeSuggestion;
use App\Models\ChallengeSubmission;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Publication;
use App\Models\StoreRewardRequest;
use App\Services\ActivityService;
use App\Services\DashboardService;
use App\Services\MembershipAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class TeacherDashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService,
        private ActivityService $activityService
    ) {}

    public function index(Request $request)
    {
        $user = auth()->user();
        $teacher = $user->teacher;

        if (!$teacher) {
            try {
                $teacher = \App\Models\Teacher::create([
                    'user_id' => $user->id,
                    'name_ar' => $user->name,
                    'name_en' => $user->name,
                    'city' => 'غير محدد',
                    'bio' => null,
                    'qualifications' => null,
                    'subjects' => json_encode([]),
                    'stages' => json_encode([]),
                    'experience_years' => 0,
                    'price_per_hour' => 0,
                    'nationality' => 'إماراتي',
                    'gender' => null,
                    'neighborhoods' => json_encode([]),
                    'is_verified' => false,
                    'is_active' => false,
                ]);

                $user->refresh();
                $user->load('teacher');
                $teacher = $user->teacher;
            } catch (\Exception $e) {
                return redirect()->route('dashboard')->with('error', 'حدث خطأ أثناء إنشاء ملف المعلم: ' . $e->getMessage());
            }
        }

        $stats = $this->dashboardService->getTeacherDashboardStats($teacher->id, $user->id);
        $membershipSummary = app(MembershipAccessService::class)->getMembershipSummary($user);

        $recentBadges = $this->activityService->getRecentBadges($user->id, 5);
        $stats['badges']['recent'] = $recentBadges;

        $recentProjects = Project::where('teacher_id', $teacher->id)
            ->select('id', 'title', 'status', 'views', 'likes', 'points_earned', 'created_at')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'status' => $project->status,
                    'views' => $project->views,
                    'likes' => $project->likes,
                    'points' => $project->points_earned,
                    'created_at' => $project->created_at->format('Y-m-d'),
                ];
            });

        $recentPublications = Publication::where('author_id', $user->id)
            ->select('id', 'title', 'type', 'status', 'views', 'likes_count', 'created_at')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($publication) {
                return [
                    'id' => $publication->id,
                    'title' => $publication->title,
                    'type' => $publication->type,
                    'status' => $publication->status,
                    'views' => $publication->views,
                    'likes' => $publication->likes_count,
                    'created_at' => $publication->created_at->format('Y-m-d'),
                ];
            });

        $stats['recentProjects'] = $recentProjects;
        $stats['recentPublications'] = $recentPublications;

        $pendingProjectSubmissions = ProjectSubmission::query()
            ->where('status', 'submitted')
            ->whereHas('project', function ($query) use ($teacher) {
                $query->where('teacher_id', $teacher->id);
            })
            ->count();

        $pendingChallengeSubmissions = ChallengeSubmission::query()
            ->where('status', 'submitted')
            ->whereHas('challenge', function ($query) use ($user) {
                $query->where('created_by', $user->id);
            })
            ->count();

        $pendingPublicationApprovals = Publication::query()
            ->where('author_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $pendingCertificateRequests = Certificate::query()
            ->where('requested_by', $user->id)
            ->where('status', 'pending_school_approval')
            ->count();

        $pendingRewardRequests = 0;
        if (Schema::hasTable('store_reward_requests')) {
            $linkedStudentIds = Project::query()
                ->where('teacher_id', $teacher->id)
                ->distinct()
                ->pluck('user_id');

            if ($linkedStudentIds->isNotEmpty()) {
                $pendingRewardRequests = StoreRewardRequest::query()
                    ->whereIn('user_id', $linkedStudentIds)
                    ->where('status', 'pending')
                    ->count();
            }
        }

        $pendingChallengeSuggestions = 0;
        if (Schema::hasTable('challenge_suggestions') && $user->school_id) {
            $pendingChallengeSuggestions = ChallengeSuggestion::query()
                ->where('school_id', $user->school_id)
                ->where('status', 'pending')
                ->count();
        }

        $stats['workflow'] = [
            'pending_project_submissions' => $pendingProjectSubmissions,
            'pending_challenge_submissions' => $pendingChallengeSubmissions,
            'pending_challenge_suggestions' => $pendingChallengeSuggestions,
            'pending_publication_approvals' => $pendingPublicationApprovals,
            'pending_certificate_requests' => $pendingCertificateRequests,
            'pending_reward_requests' => $pendingRewardRequests,
        ];

        $isActive = (bool) $teacher->is_active;
        $isVerified = (bool) $teacher->is_verified;

        return Inertia::render('Teacher/Dashboard', [
            'teacher' => [
                'name' => $teacher->name_ar,
                'subjects' => is_array($teacher->subjects) ? $teacher->subjects : json_decode($teacher->subjects, true),
                'is_active' => $isActive,
                'is_verified' => $isVerified,
            ],
            'stats' => $stats,
            'membershipSummary' => $membershipSummary,
            'activationBanner' => !$isActive ? [
                'is_verified' => $isVerified,
            ] : null,
        ]);
    }
}
