<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\ChallengeSuggestion;
use App\Models\ChallengeSubmission;
use App\Models\Project;
use App\Models\Publication;
use App\Models\StoreRewardRequest;
use App\Models\User;
use App\Services\DashboardService;
use App\Services\MembershipAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class SchoolDashboardController extends Controller
{
    public function __construct(
        private DashboardService $dashboardService
    ) {}

    public function index(Request $request)
    {
        $school = Auth::user();

        // Get optimized dashboard stats from service
        $stats = $this->dashboardService->getSchoolDashboardStats($school->canAccessAllSchoolData() ? 0 : $school->id);
        $membershipSummary = app(MembershipAccessService::class)->getMembershipSummary($school);

        // Get pending projects for review
        $studentIdsQuery = User::where('role', 'student');
        if (!$school->canAccessAllSchoolData()) {
            $studentIdsQuery->where('school_id', $school->id);
        }
        $studentIds = $studentIdsQuery->pluck('id');

        $pendingProjectsList = Project::whereIn('user_id', $studentIds)
            ->where('status', 'pending')
            ->with('user:id,name')
            ->select('id', 'title', 'category', 'user_id', 'created_at')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'category' => $project->category,
                    'student_name' => $project->user->name ?? 'غير محدد',
                    'student_id' => $project->user_id,
                    'created_at' => $project->created_at->format('Y-m-d H:i'),
                ];
            });

        // Get recent approved projects
        $recentApprovedProjects = Project::whereIn('user_id', $studentIds)
            ->where('status', 'approved')
            ->with('user:id,name')
            ->select('id', 'title', 'category', 'user_id', 'points_earned', 'approved_at')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($project) {
                return [
                    'id' => $project->id,
                    'title' => $project->title,
                    'category' => $project->category,
                    'student_name' => $project->user->name ?? 'غير محدد',
                    'points_earned' => $project->points_earned ?? 0,
                    'approved_at' => $project->approved_at?->format('Y-m-d H:i'),
                ];
            });

        $pendingPublicationsQuery = Publication::query()
            ->where('status', 'pending');
        if (!$school->canAccessAllSchoolData()) {
            $pendingPublicationsQuery->where('school_id', $school->id);
        } else {
            $pendingPublicationsQuery->whereNotNull('school_id');
        }

        $pendingCertificatesQuery = Certificate::query()
            ->where('status', 'pending_school_approval');
        if (!$school->canAccessAllSchoolData()) {
            $pendingCertificatesQuery->where('school_id', $school->id);
        } else {
            $pendingCertificatesQuery->whereNotNull('school_id');
        }

        $pendingChallengeSubmissionsQuery = ChallengeSubmission::query()
            ->where('status', 'submitted')
            ->whereHas('challenge', function ($query) use ($school) {
                if ($school->canAccessAllSchoolData()) {
                    $query->whereNotNull('school_id');
                } else {
                    $query->where('school_id', $school->id);
                }
            });

        $pendingRewardRequests = 0;
        if (Schema::hasTable('store_reward_requests')) {
            $pendingRewardRequestsQuery = StoreRewardRequest::query()
                ->where('status', 'pending');

            if (!$school->canAccessAllSchoolData()) {
                $pendingRewardRequestsQuery->whereIn('user_id', $studentIds);
            }

            $pendingRewardRequests = $pendingRewardRequestsQuery->count();
        }

        $pendingChallengeSuggestions = 0;
        if (Schema::hasTable('challenge_suggestions')) {
            $pendingChallengeSuggestionsQuery = ChallengeSuggestion::query()
                ->whereIn('status', ['pending', 'under_review']);

            if ($school->canAccessAllSchoolData()) {
                $pendingChallengeSuggestionsQuery->whereNotNull('school_id');
            } else {
                $pendingChallengeSuggestionsQuery->where('school_id', $school->id);
            }

            $pendingChallengeSuggestions = $pendingChallengeSuggestionsQuery->count();
        }

        $stats['workflow'] = [
            'pending_publications' => $pendingPublicationsQuery->count(),
            'pending_certificates' => $pendingCertificatesQuery->count(),
            'pending_challenge_submissions' => $pendingChallengeSubmissionsQuery->count(),
            'pending_reward_requests' => $pendingRewardRequests,
            'pending_challenge_suggestions' => $pendingChallengeSuggestions,
        ];

        return Inertia::render('School/Dashboard', [
            'stats' => $stats,
            'pendingProjects' => $pendingProjectsList,
            'recentApprovedProjects' => $recentApprovedProjects,
            'membershipSummary' => $membershipSummary,
        ]);
    }
}
