<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\UserBadge;
use App\Services\MembershipCertificateService;
use App\Services\MembershipAccessService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentCertificateController extends Controller
{
    public function __construct(
        protected MembershipCertificateService $membershipCertificateService,
        protected MembershipAccessService $membershipAccessService,
    ) {}

    /**
     * Show student certificate page
     */
    public function show()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'student') {
            abort(403, 'Unauthorized action.');
        }

        $membershipSummary = $this->membershipAccessService->getMembershipSummary($user);

        // Get student stats
        $projectsCount = Project::where('user_id', $user->id)->count();
        $badgesCount   = UserBadge::where('user_id', $user->id)->count();
        $joinDate      = $user->created_at ? $user->created_at->format('Y-m-d') : now()->format('Y-m-d');
        $issueDate     = now()->format('Y-m-d');

        // Get membership certificate if exists
        $membershipCertificate = $this->membershipCertificateService
            ->getUserMembershipCertificate($user->id, $user->role);

        return Inertia::render('Student/Certificate/Show', [
            'membershipSummary' => $membershipSummary,
            'user' => [
                'id'                => $user->id,
                'name'              => $user->name,
                'membership_number' => $user->membership_number
                    ?? 'STU-' . now()->format('Y') . '-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            ],
            'stats' => [
                'projects_count' => $projectsCount,
                'badges_count'   => $badgesCount,
                'join_date'      => $joinDate,
            ],
            'certificate' => [
                'certificate_number'       => $membershipCertificate?->certificate_number,
                'issue_date'               => $membershipCertificate
                    ? $membershipCertificate->issue_date->format('Y-m-d')
                    : $issueDate,
                'achievement_period_start' => $joinDate,
                'achievement_period_end'   => now()->format('Y-m-d'),
                'download_url'             => $membershipCertificate
                    ? route('membership-certificates.download', $membershipCertificate->id)
                    : null,
            ],
        ]);
    }
}
