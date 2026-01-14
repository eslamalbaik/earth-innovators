<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\MembershipCertificateService;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MembershipCertificateController extends Controller
{
    protected $membershipCertificateService;

    public function __construct(MembershipCertificateService $membershipCertificateService)
    {
        $this->membershipCertificateService = $membershipCertificateService;
    }

    /**
     * Show user's membership certificate
     */
    public function show(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            abort(403, 'Unauthorized');
        }

        // Get membership certificate
        $certificate = $this->membershipCertificateService->getUserMembershipCertificate(
            $user->id,
            $user->role
        );

        // Get eligibility status
        $eligibility = $this->membershipCertificateService->getEligibilityStatus(
            $user->id,
            $user->role
        );

        // Check if user can view this certificate
        if ($certificate && !$this->canViewCertificate($user, $certificate)) {
            abort(403, 'You do not have permission to view this certificate');
        }

        return Inertia::render('MembershipCertificate/Show', [
            'certificate' => $certificate ? [
                'id' => $certificate->id,
                'certificate_number' => $certificate->certificate_number,
                'title' => $certificate->title_ar ?? $certificate->title,
                'description' => $certificate->description_ar ?? $certificate->description,
                'issue_date' => $certificate->issue_date->format('Y-m-d'),
                'issue_date_formatted' => $certificate->issue_date->format('d/m/Y'),
                'file_path' => $certificate->file_path ? Storage::disk('public')->url($certificate->file_path) : null,
                'download_url' => route('membership-certificates.download', $certificate->id),
            ] : null,
            'eligibility' => $eligibility,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'membership_number' => $user->membership_number ?? 'N/A',
            ],
        ]);
    }

    /**
     * Download membership certificate PDF
     */
    public function download($id)
    {
        $user = Auth::user();
        $certificate = Certificate::findOrFail($id);

        // Check if user can download this certificate
        if (!$this->canViewCertificate($user, $certificate)) {
            abort(403, 'You do not have permission to download this certificate');
        }

        // Check if certificate file exists
        if (!$certificate->file_path || !Storage::disk('public')->exists($certificate->file_path)) {
            abort(404, 'Certificate file not found');
        }

        $filePath = Storage::disk('public')->path($certificate->file_path);
        
        return response()->download(
            $filePath, 
            "certificate_{$certificate->certificate_number}.pdf",
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="certificate_' . $certificate->certificate_number . '.pdf"',
            ]
        );
    }

    /**
     * Check eligibility status
     */
    public function checkEligibility(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $eligibility = $this->membershipCertificateService->getEligibilityStatus(
            $user->id,
            $user->role
        );

        // Try to award certificate if eligible
        if ($eligibility['eligible']) {
            if ($user->role === 'student') {
                $certificate = $this->membershipCertificateService->checkAndAwardStudentMembership($user->id);
            } elseif ($user->role === 'teacher') {
                $certificate = $this->membershipCertificateService->checkAndAwardTeacherMembership($user->id);
            } elseif ($user->role === 'school') {
                $certificate = $this->membershipCertificateService->checkAndAwardSchoolMembership($user->id);
            }
        }

        return response()->json([
            'success' => true,
            'eligibility' => $eligibility,
            'has_certificate' => $certificate !== null,
        ]);
    }

    /**
     * Check if user can view certificate
     */
    protected function canViewCertificate($user, Certificate $certificate): bool
    {
        // Admin can view any certificate
        if ($user->isAdmin()) {
            return true;
        }

        // User can view their own certificate
        if ($certificate->user_id && $certificate->user_id === $user->id) {
            return true;
        }

        // School can view certificates of their students
        if ($certificate->school_id && $certificate->school_id === $user->id) {
            return true;
        }

        // School can view their own certificate
        if ($user->isSchool() && $certificate->school_id === $user->id && !$certificate->user_id) {
            return true;
        }

        return false;
    }
}

