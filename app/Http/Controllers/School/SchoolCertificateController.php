<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\User;
use App\Services\CertificateService;
use App\Services\MembershipAccessService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SchoolCertificateController extends Controller
{
    public function __construct(
        private CertificateService $certificateService,
        private MembershipAccessService $membershipAccessService
    ) {}

    public function index(Request $request)
    {
        $school = Auth::user();

        $recipients = User::where('school_id', $school->id)
            ->whereIn('role', ['student', 'teacher'])
            ->withCount([
                'certificates as approved_certificates_count' => function ($query) {
                    $query->where('status', 'approved');
                },
                'certificates as pending_certificates_count' => function ($query) {
                    $query->where('status', 'pending_school_approval');
                },
            ])
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(function ($recipient) {
                return [
                    'id' => $recipient->id,
                    'name' => $recipient->name,
                    'email' => $recipient->email,
                    'role' => $recipient->role,
                    'membership_number' => $recipient->membership_number,
                    'approved_certificates_count' => (int) ($recipient->approved_certificates_count ?? 0),
                    'pending_certificates_count' => (int) ($recipient->pending_certificates_count ?? 0),
                    'created_at' => $recipient->created_at?->toISOString(),
                ];
            });

        $pendingRequests = Certificate::with(['user:id,name,email,role,membership_number', 'requester:id,name'])
            ->where('school_id', $school->id)
            ->where('status', 'pending_school_approval')
            ->latest()
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'type' => $certificate->type,
                    'title' => $certificate->title_ar ?? $certificate->title,
                    'description' => $certificate->description_ar ?? $certificate->description,
                    'recipient' => $certificate->user ? [
                        'id' => $certificate->user->id,
                        'name' => $certificate->user->name,
                        'email' => $certificate->user->email,
                        'role' => $certificate->user->role,
                        'membership_number' => $certificate->user->membership_number,
                    ] : null,
                    'requester' => $certificate->requester ? [
                        'id' => $certificate->requester->id,
                        'name' => $certificate->requester->name,
                    ] : null,
                    'created_at' => $certificate->created_at?->format('Y-m-d H:i'),
                ];
            });

        $recentIssuedCertificates = Certificate::with(['user:id,name,role', 'reviewer:id,name'])
            ->where('school_id', $school->id)
            ->where('status', 'approved')
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($certificate) {
                return [
                    'id' => $certificate->id,
                    'certificate_number' => $certificate->certificate_number,
                    'type' => $certificate->type,
                    'title' => $certificate->title_ar ?? $certificate->title,
                    'recipient_name' => $certificate->user->name ?? 'غير محدد',
                    'recipient_role' => $certificate->user->role ?? null,
                    'download_url' => $certificate->file_path ? route('certificates.download', $certificate->id) : null,
                    'approved_at' => optional($certificate->approved_at ?? $certificate->created_at)?->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('School/Certificates/Index', [
            'recipients' => $recipients,
            'pendingRequests' => $pendingRequests,
            'recentIssuedCertificates' => $recentIssuedCertificates,
            'membershipSummary' => $this->membershipAccessService->getMembershipSummary($school),
        ]);
    }

    public function approve(Certificate $certificate)
    {
        $school = Auth::user();

        if (!$this->canReviewCertificate($school, $certificate)) {
            abort(403, 'غير مصرح لك باعتماد هذه الشهادة.');
        }

        if (!$this->membershipAccessService->hasCertificateAccess($school)) {
            return redirect()->back()->with('error', 'عضوية المدرسة الحالية لا تسمح باعتماد أو إصدار الشهادات.');
        }

        $recipient = $certificate->user;
        if (!$recipient) {
            return redirect()->back()->with('error', 'تعذر العثور على صاحب الشهادة.');
        }

        $issueDate = now()->toDateString();
        $certificateNumber = str_starts_with((string) $certificate->certificate_number, 'REQ-')
            ? $this->certificateService->generateCertificateNumber($recipient)
            : $certificate->certificate_number;

        $preparedData = [
            'course_name' => $certificate->title_ar ?? $certificate->title,
            'description' => $certificate->description_ar ?? $certificate->description,
            'description_ar' => $certificate->description_ar ?? $certificate->description,
            'certificate_number' => $certificateNumber,
            'issue_date' => $issueDate,
            'template' => $certificate->template ?? 'default',
            'therapeutic_plan' => $certificate->therapeutic_plan,
        ];

        if ($certificate->file_path && Storage::disk('public')->exists($certificate->file_path)) {
            Storage::disk('public')->delete($certificate->file_path);
        }

        $filePath = $this->certificateService->generateCertificate(
            $recipient,
            $school,
            $preparedData,
            null,
            'Y-m-d',
            $certificate->type
        );

        $certificate->update([
            'certificate_number' => $certificateNumber,
            'issued_by' => $school->id,
            'reviewed_by' => $school->id,
            'status' => 'approved',
            'issue_date' => $issueDate,
            'approved_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null,
            'file_path' => $filePath,
            'is_active' => true,
        ]);

        event(new \App\Events\CertificateIssued($certificate->fresh(), $recipient));

        return redirect()->back()->with('success', [
            'key' => 'schoolCertificatesIndexPage.toasts.approveSuccess',
        ]);
    }

    public function reject(Request $request, Certificate $certificate)
    {
        $school = Auth::user();

        if (!$this->canReviewCertificate($school, $certificate)) {
            abort(403, 'غير مصرح لك برفض هذه الشهادة.');
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $certificate->update([
            'reviewed_by' => $school->id,
            'status' => 'rejected',
            'rejected_at' => now(),
            'approved_at' => null,
            'rejection_reason' => $validated['rejection_reason'],
            'is_active' => false,
        ]);

        return redirect()->back()->with('success', [
            'key' => 'schoolCertificatesIndexPage.toasts.rejectSuccess',
        ]);
    }

    public function show()
    {
        $user = Auth::user();

        if (!$user || (!$user->isSchool() && !$user->canAccessAllSchoolData())) {
            abort(403, 'Unauthorized action.');
        }

        $membershipCertificateService = app(\App\Services\MembershipCertificateService::class);
        $membershipCertificate = $membershipCertificateService->getUserMembershipCertificate($user->id, $user->role);

        return Inertia::render('School/Certificate/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'school_name' => $user->institution ?: $user->name,
                'membership_number' => $user->membership_number ?? 'SCH-' . now()->format('Y') . '-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            ],
            'stats' => [],
            'certificate' => [
                'certificate_number' => $membershipCertificate?->certificate_number,
                'issue_date' => $membershipCertificate ? $membershipCertificate->issue_date->format('Y-m-d') : now()->format('Y-m-d'),
                'download_url' => $membershipCertificate ? route('membership-certificates.download', $membershipCertificate->id) : null,
            ],
            'membershipSummary' => $this->membershipAccessService->getMembershipSummary($user),
        ]);
    }

    protected function canReviewCertificate(User $school, Certificate $certificate): bool
    {
        return $certificate->school_id == $school->id && $certificate->status === 'pending_school_approval';
    }
}
