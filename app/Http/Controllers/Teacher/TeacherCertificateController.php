<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Project;
use App\Models\User;
use App\Services\CertificateService;
use App\Services\MembershipAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherCertificateController extends Controller
{
    public function __construct(
        private CertificateService $certificateService,
        private MembershipAccessService $membershipAccessService
    ) {}

    public function index(Request $request)
    {
        $teacherUser = Auth::user();
        $teacherId = $teacherUser->teacher?->id;

        $teacherProjects = Project::where('teacher_id', $teacherId)
            ->pluck('user_id')
            ->unique();

        $query = User::whereIn('id', $teacherProjects)
            ->where('role', 'student')
            ->withCount([
                'certificates as approved_certificates_count' => function ($certificateQuery) {
                    $certificateQuery->where('status', 'approved');
                },
            ]);

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
                    'certificates_count' => (int) ($student->approved_certificates_count ?? 0),
                    'created_at' => $student->created_at ? $student->created_at->toISOString() : null,
                ];
            });

        $requestHistory = Certificate::with(['user:id,name,role', 'reviewer:id,name'])
            ->where('requested_by', $teacherUser->id)
            ->latest()
            ->limit(25)
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'title' => $certificate->title_ar ?? $certificate->title,
                    'type' => $certificate->type,
                    'status' => $certificate->status,
                    'rejection_reason' => $certificate->rejection_reason,
                    'recipient' => $certificate->user ? [
                        'id' => $certificate->user->id,
                        'name' => $certificate->user->name,
                        'role' => $certificate->user->role,
                    ] : null,
                    'reviewer' => $certificate->reviewer ? [
                        'id' => $certificate->reviewer->id,
                        'name' => $certificate->reviewer->name,
                    ] : null,
                    'download_url' => $certificate->file_path ? route('certificates.download', $certificate->id) : null,
                    'created_at' => $certificate->created_at?->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Teacher/Certificates/Index', [
            'students' => $students,
            'teacherRecipient' => [
                'id' => $teacherUser->id,
                'name' => $teacherUser->name,
                'email' => $teacherUser->email,
                'membership_number' => $teacherUser->membership_number,
                'certificates_count' => Certificate::where('user_id', $teacherUser->id)
                    ->where('status', 'approved')
                    ->count(),
                'created_at' => $teacherUser->created_at?->toISOString(),
            ],
            'requestHistory' => $requestHistory,
            'school' => $teacherUser->school ? [
                'id' => $teacherUser->school->id,
                'name' => $teacherUser->school->name,
            ] : null,
            'membershipSummary' => $this->membershipAccessService->getMembershipSummary($teacherUser),
            'description' => 'يمكنك طلب شهادة لك أو لطلابك، وسيتم إرسالها إلى المدرسة لاعتمادها قبل إصدار النسخة النهائية.',
        ]);
    }

    public function show()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'teacher' || !$user->teacher) {
            abort(403, 'Unauthorized action.');
        }

        $membershipCertificateService = app(\App\Services\MembershipCertificateService::class);
        $membershipCertificate = $membershipCertificateService->getUserMembershipCertificate($user->id, $user->role);

        $latestApprovedCertificates = Certificate::where('user_id', $user->id)
            ->where('status', 'approved')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'title' => $certificate->title_ar ?? $certificate->title,
                    'download_url' => $certificate->file_path ? route('certificates.download', $certificate->id) : null,
                    'approved_at' => optional($certificate->approved_at ?? $certificate->created_at)?->format('Y-m-d'),
                ];
            });

        return Inertia::render('Teacher/Certificate/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'membership_number' => $user->membership_number ?? 'TCH-' . now()->format('Y') . '-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            ],
            'stats' => [],
            'certificate' => [
                'certificate_number' => $membershipCertificate?->certificate_number,
                'issue_date' => $membershipCertificate ? $membershipCertificate->issue_date->format('Y-m-d') : now()->format('Y-m-d'),
                'period_start' => optional($user->teacher->contract_start_date ?? $user->created_at)?->format('Y-m-d'),
                'period_end' => optional($user->teacher->contract_end_date ?? now()->addYear())?->format('Y-m-d'),
                'download_url' => $membershipCertificate ? route('membership-certificates.download', $membershipCertificate->id) : null,
            ],
            'membershipSummary' => $this->membershipAccessService->getMembershipSummary($user),
            'school' => $user->school ? [
                'id' => $user->school->id,
                'name' => $user->school->name,
            ] : null,
            'latestApprovedCertificates' => $latestApprovedCertificates,
        ]);
    }
}
