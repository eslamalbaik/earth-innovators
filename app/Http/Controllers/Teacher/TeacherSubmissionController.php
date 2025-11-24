<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Badge;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherSubmissionController extends Controller
{
    public function __construct(
        private SubmissionService $submissionService
    ) {}

    /**
     * عرض تسليمات المشاريع للمعلم
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $teacherModel = $user->teacher;

        if (!$teacherModel) {
            return redirect()->route('teacher.dashboard')
                ->with('error', 'لم يتم العثور على بيانات المعلم');
        }

        $submissions = $this->submissionService->getTeacherSubmissions(
            $teacherModel->id,
            $request->get('status'),
            $request->get('search'),
            15
        )->withQueryString();

        return Inertia::render('Teacher/Submissions/Index', [
            'submissions' => $submissions,
        ]);
    }

    /**
     * عرض تفاصيل تسليم
     */
    public function show(ProjectSubmission $submission)
    {
        $user = Auth::user();
        $teacherModel = $user->teacher;

        if (!$teacherModel) {
            abort(403, 'لم يتم العثور على بيانات المعلم');
        }

        // التحقق من أن المشروع للمعلم
        if ($submission->project->teacher_id !== $teacherModel->id) {
            abort(403, 'غير مصرح لك بعرض هذا التسليم');
        }

        // المشاريع التي أنشأها المعلم
        $teacherProjects = Project::where('teacher_id', $teacherModel->id)
            ->where('status', 'approved')
            ->pluck('id');

        $submission->load(['project', 'student', 'reviewer']);

        // الحصول على الشارات المتاحة
        $availableBadges = Badge::where('is_active', true)
            ->where('status', 'approved')
            ->get();

        // الحصول على جميع المشاريع المقدمة للمعلم
        $allSubmissions = ProjectSubmission::whereIn('project_id', $teacherProjects)
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

        return Inertia::render('Teacher/Submissions/Show', [
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
        $user = Auth::user();
        $teacherModel = $user->teacher;

        if (!$teacherModel) {
            abort(403, 'لم يتم العثور على بيانات المعلم');
        }

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
                $user->id,
                null, // school_id
                $teacherModel->id
            );

            return redirect()->back()->with('success', 'تم تقييم التسليم بنجاح!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
