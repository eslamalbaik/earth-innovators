<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Certificate;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolCertificateController extends Controller
{
    protected $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Display certificate generation page for school
     */
    public function index(Request $request)
    {
        $school = Auth::user();

        // Get all students for this school
        $query = User::where('role', 'student');
        if (!$school->canAccessAllSchoolData()) {
            $query->where('school_id', $school->id);
        }
        $query->withCount('certificates');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('membership_number', 'like', "%{$search}%");
            });
        }

        $students = $query->latest()->paginate(20)->withQueryString()
            ->through(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                    'email' => $student->email,
                    'membership_number' => $student->membership_number,
                    'certificates_count' => $student->certificates_count,
                    'created_at' => $student->created_at ? $student->created_at->toISOString() : null,
                ];
            });

        return Inertia::render('School/Certificates/Index', [
            'students' => $students,
            'description' => 'قائمة بجميع الطلاب مع إمكانية إنشاء شهادات جماعية أو فردية',
        ]);
    }

    /**
     * Show school certificate page
     */
    public function show()
    {
        $user = Auth::user();

        if (!$user || (!$user->isSchool() && !$user->canAccessAllSchoolData())) {
            abort(403, 'Unauthorized action.');
        }

        $school = \App\Models\School::where('user_id', $user->id)->first();
        $joinDate = $user->created_at ? $user->created_at->format('Y-m-d') : now()->format('Y-m-d');
        $issueDate = now()->format('Y-m-d');

        // Get membership certificate if exists
        $membershipCertificateService = app(\App\Services\MembershipCertificateService::class);
        $membershipCertificate = $membershipCertificateService->getUserMembershipCertificate($user->id, $user->role);

        return Inertia::render('School/Certificate/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'school_name' => $school ? $school->name : $user->name,
                'membership_number' => $user->membership_number ?? 'SCH-' . now()->format('Y') . '-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            ],
            'stats' => [],
            'certificate' => [
                'issue_date' => $membershipCertificate ? $membershipCertificate->issue_date->format('Y-m-d') : $issueDate,
                'download_url' => $membershipCertificate ? route('membership-certificates.download', $membershipCertificate->id) : null,
            ],
        ]);
    }
}

