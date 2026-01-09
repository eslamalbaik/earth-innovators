<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use App\Services\CertificateService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

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
}

