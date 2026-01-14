<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\UserBadge;
use App\Services\MembershipCertificateService;

class StudentCertificateController extends Controller
{
    protected $membershipCertificateService;

    public function __construct(MembershipCertificateService $membershipCertificateService)
    {
        $this->membershipCertificateService = $membershipCertificateService;
    }

    /**
     * Show student certificate page
     */
    public function show()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'student') {
            abort(403, 'Unauthorized action.');
        }

        // Get student stats
        $projectsCount = Project::where('user_id', $user->id)->count();
        $badgesCount = UserBadge::where('user_id', $user->id)->count();
        $joinDate = $user->created_at ? $user->created_at->format('Y-m-d') : now()->format('Y-m-d');
        $issueDate = now()->format('Y-m-d');

        // Get membership certificate if exists
        $membershipCertificate = $this->membershipCertificateService->getUserMembershipCertificate($user->id, $user->role);

        return Inertia::render('Student/Certificate/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'membership_number' => $user->membership_number ?? 'STU-' . now()->format('Y') . '-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            ],
            'stats' => [
                'projects_count' => $projectsCount,
                'badges_count' => $badgesCount,
                'join_date' => $joinDate,
            ],
            'certificate' => [
                'issue_date' => $membershipCertificate ? $membershipCertificate->issue_date->format('Y-m-d') : $issueDate,
                'achievement_period_start' => $joinDate,
                'achievement_period_end' => now()->format('Y-m-d'),
                'download_url' => $membershipCertificate ? route('membership-certificates.download', $membershipCertificate->id) : null,
            ],
        ]);
    }
}

