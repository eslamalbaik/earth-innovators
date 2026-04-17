<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Services\MembershipAccessService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolCertificateShowController extends Controller
{
    public function __construct(
        protected MembershipAccessService $membershipAccessService
    ) {}

    public function show()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'school') {
            abort(403, 'Unauthorized action.');
        }

        $membershipSummary = $this->membershipAccessService->getMembershipSummary($user);

        $joinDate  = $user->created_at ? $user->created_at->format('Y-m-d') : now()->format('Y-m-d');
        $issueDate = now()->format('Y/m/d');

        return Inertia::render('School/Certificate/Show', [
            'membershipSummary' => $membershipSummary,
            'user' => [
                'id'                => $user->id,
                'name'              => $user->name ?? $user->institution ?? 'مدرسة غير محددة',
                'school_name'       => $user->institution ?? $user->name,
                'membership_number' => $user->membership_number
                    ?? 'SCH-' . now()->format('Y') . '-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            ],
            'certificate' => [
                'issue_date' => $issueDate,
                'year'       => now()->format('Y'),
                'download_url' => null, // سيُضاف لاحقاً عند تفعيل توليد الشهادة PDF
            ],
        ]);
    }
}
