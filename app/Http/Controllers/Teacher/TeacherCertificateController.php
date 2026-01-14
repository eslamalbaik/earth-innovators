<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class TeacherCertificateController extends Controller
{
    protected $certificateService;

    public function __construct(CertificateService $certificateService)
    {
        $this->certificateService = $certificateService;
    }

    /**
     * Display certificate generation page for teacher
     */
    public function index(Request $request)
    {
        $teacher = Auth::user();

        // Get students who have projects with this teacher
        $teacherProjects = Project::where('teacher_id', $teacher->id)
            ->pluck('user_id')
            ->unique();

        $query = User::whereIn('id', $teacherProjects)
            ->where('role', 'student')
            ->withCount('certificates');

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

        return Inertia::render('Teacher/Certificates/Index', [
            'students' => $students,
            'description' => 'قائمة بطلابك فقط مع إمكانية إنشاء شهادات فردية وتعديل الحقول المسموح بها',
        ]);
    }

    /**
     * Show teacher certificate page
     */
    public function show()
    {
        $user = Auth::user();

        if (!$user || $user->role !== 'teacher' || !$user->teacher) {
            abort(403, 'Unauthorized action.');
        }

        $teacher = $user->teacher;
        $joinDate = $user->created_at ? $user->created_at->format('Y-m-d') : now()->format('Y-m-d');
        $issueDate = now()->format('Y-m-d');

        // Calculate period (from join date to one year later)
        $periodStart = $joinDate;
        $periodEnd = $user->created_at 
            ? Carbon::parse($user->created_at)->addYear()->format('Y-m-d') 
            : now()->addYear()->format('Y-m-d');

        // Get membership certificate if exists
        $membershipCertificateService = app(\App\Services\MembershipCertificateService::class);
        $membershipCertificate = $membershipCertificateService->getUserMembershipCertificate($user->id, $user->role);

        return Inertia::render('Teacher/Certificate/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'membership_number' => $user->membership_number ?? 'TCH-' . now()->format('Y') . '-' . str_pad($user->id, 3, '0', STR_PAD_LEFT),
            ],
            'stats' => [],
            'certificate' => [
                'issue_date' => $membershipCertificate ? $membershipCertificate->issue_date->format('Y-m-d') : $issueDate,
                'period_start' => $periodStart,
                'period_end' => $periodEnd,
                'download_url' => $membershipCertificate ? route('membership-certificates.download', $membershipCertificate->id) : null,
            ],
        ]);
    }
}

