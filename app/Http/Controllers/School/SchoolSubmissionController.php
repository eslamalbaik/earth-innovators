<?php

namespace App\Http\Controllers\School;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Badge;
use App\Models\User;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class SchoolSubmissionController extends Controller
{
    public function __construct(
        private SubmissionService $submissionService
    ) {}

    /**
     * عرض تسليمات المشاريع للمدرسة
     */
    public function index(Request $request)
    {
        $school = Auth::user();

        $submissions = $this->submissionService->getSchoolSubmissions(
            $school->id,
            $request->get('status'),
            $request->get('student_id'),
            $request->get('search'),
            15
        )->withQueryString();

        $students = User::where('school_id', $school->id)
            ->where('role', 'student')
            ->select('id', 'name')
            ->get()
            ->map(function ($student) {
                return [
                    'id' => $student->id,
                    'name' => $student->name,
                ];
            });

        return Inertia::render('School/Submissions/Index', [
            'submissions' => $submissions,
            'students' => $students,
        ]);
    }

    /**
     * عرض تفاصيل تسليم
     */
    public function show(ProjectSubmission $submission)
    {
        $school = Auth::user();

        // التحقق من أن المشروع للمدرسة أو مشروع من الإدارة مرتبط بهذه المدرسة
        $isSchoolProject = $submission->project->school_id === $school->id;
        $isAdminProjectForSchool = $submission->project->user && 
                                   $submission->project->user->role === 'admin' && 
                                   $submission->project->school_id === $school->id;
        
        if (!$isSchoolProject && !$isAdminProjectForSchool) {
            abort(403, 'غير مصرح لك بعرض هذا التسليم');
        }

        // المشاريع المعتمدة للمدرسة (بما في ذلك مشاريع الإدارة المرتبطة بهذه المدرسة)
        $schoolProjects = Project::where(function($query) use ($school) {
                $query->where('school_id', $school->id)
                      ->orWhere(function($q) use ($school) {
                          $q->whereHas('user', function($userQuery) {
                              $userQuery->where('role', 'admin');
                          })->where('school_id', $school->id);
                      });
            })
            ->where('status', 'approved')
            ->pluck('id');

        $submission->load(['project', 'student', 'reviewer']);

        // الحصول على الشارات المتاحة
        $availableBadges = Badge::where('is_active', true)
            ->where('status', 'approved')
            ->get();

        // الحصول على جميع المشاريع المقدمة للمدرسة
        $allSubmissions = ProjectSubmission::whereIn('project_id', $schoolProjects)
            ->with(['project', 'student'])
            ->latest()
            ->get()
            ->map(function ($sub) {
                return [
                    'id' => $sub->id,
                    'project_title' => $sub->project->title,
                    'student_name' => $sub->student->name,
                    'submitted_at' => $sub->submitted_at ? $sub->submitted_at->format('Y/m/d') : null,
                ];
            });

        return Inertia::render('School/Submissions/Show', [
            'submission' => $submission,
            'availableBadges' => $availableBadges,
            'allSubmissions' => $allSubmissions,
        ]);
    }

    /**
     * تقييم تسليم مشروع
     */
    public function evaluate(Request $request, ProjectSubmission $submission)
    {
        $request->validate([
            'rating' => 'required|numeric|min:0|max:5',
            'feedback' => 'nullable|string|max:2000',
            'status' => 'required|in:reviewed,approved,rejected',
            'badges' => 'nullable|array',
            'badges.*' => 'exists:badges,id',
        ], [
            'rating.required' => 'التقييم مطلوب',
            'rating.min' => 'التقييم يجب أن يكون بين 0 و 5',
            'rating.max' => 'التقييم يجب أن يكون بين 0 و 5',
            'status.required' => 'الحالة مطلوبة',
        ]);

        try {
            $this->submissionService->evaluateSubmission(
                $submission,
                $request->only(['rating', 'feedback', 'status', 'badges']),
                Auth::id(),
                Auth::id(), // school_id
                null
            );

            return redirect()->back()->with('success', 'تم تقييم التسليم بنجاح!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
