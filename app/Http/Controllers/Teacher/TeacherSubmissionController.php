<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\Badge;
use App\Services\AIEngine\RubricEvaluationService;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TeacherSubmissionController extends Controller
{
    public function __construct(
        private SubmissionService $submissionService,
        private RubricEvaluationService $rubricEvaluationService,
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
                ->with('error', __('messages.msg_075'));
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
            abort(403, __('messages.msg_075'));
        }

        // التحقق من أن المشروع للمعلم
        if ($submission->project->teacher_id !== $teacherModel->id) {
            abort(403, __('messages.msg_153'));
        }

        // المشاريع التي أنشأها المعلم
        $teacherProjects = Project::where('teacher_id', $teacherModel->id)
            ->where('status', 'approved')
            ->pluck('id');

        $submission->load(['project.rubric.criteria', 'student', 'reviewer']);

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
            abort(403, __('messages.msg_075'));
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

            return redirect()->back()->with('success', __('messages.msg_034'));
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * توليد شرح الذكاء الاصطناعي لكل مؤشر أداء (معيار) في معيار التقييم
     * (Rubric) المرتبط بمشروع هذا التسليم. يُستبدل أي تقييم سابق غير
     * منشور؛ إن كان التقييم السابق قد نُشر للطالب تبقى نسخته كما هي حتى
     * يحفظ المعلم النتيجة الجديدة صراحةً.
     */
    public function generateRubricEvaluation(ProjectSubmission $submission): JsonResponse
    {
        $teacherModel = $this->authorizeSubmissionAccess($submission);

        if ($submission->project->teacher_id !== $teacherModel->id) {
            abort(403, __('messages.msg_153'));
        }

        // توليد الشرح قد يستغرق وقتاً بسبب إعادة المحاولة التلقائية في GeminiClient.
        set_time_limit(300);

        try {
            $evaluation = $this->rubricEvaluationService->evaluate($submission);
        } catch (\Throwable $e) {
            \Log::error('Rubric evaluation generation failed', ['submission_id' => $submission->id, 'error' => $e->getMessage()]);

            return response()->json(['success' => false, 'message' => 'تعذر توليد التقييم حالياً. حاول مرة أخرى بعد قليل.'], 422);
        }

        $submission->update(['ai_rubric_evaluation' => $evaluation]);

        return response()->json(['success' => true, 'evaluation' => $evaluation]);
    }

    /**
     * يحفظ تعديلات المعلم على شروح مؤشرات الأداء، ويتحكم بنشر التقييم
     * للطالب عبر released. لا يُعاد توليد أي محتوى هنا — تحرير نصي فقط.
     */
    public function saveRubricEvaluation(Request $request, ProjectSubmission $submission): JsonResponse
    {
        $teacherModel = $this->authorizeSubmissionAccess($submission);

        if ($submission->project->teacher_id !== $teacherModel->id) {
            abort(403, __('messages.msg_153'));
        }

        $validated = $request->validate([
            'release'                    => 'required|boolean',
            'criteria'                   => 'required|array|min:1',
            'criteria.*.criterion_id'    => 'required|integer',
            'criteria.*.explanation'     => 'required|string|min:1|max:4000',
            'criteria.*.explanation_ar'  => 'required|string|min:1|max:4000',
        ]);

        $evaluation = $submission->ai_rubric_evaluation;
        if (! $evaluation) {
            return response()->json(['success' => false, 'message' => 'لا يوجد تقييم لحفظه بعد.'], 422);
        }

        $editsById = collect($validated['criteria'])->keyBy('criterion_id');

        $evaluation['criteria'] = collect($evaluation['criteria'])->map(function (array $criterion) use ($editsById) {
            $edit = $editsById->get($criterion['criterion_id']);
            if (! $edit) {
                return $criterion;
            }

            $changed = $edit['explanation'] !== $criterion['explanation']
                || $edit['explanation_ar'] !== $criterion['explanation_ar'];

            $criterion['explanation'] = $edit['explanation'];
            $criterion['explanation_ar'] = $edit['explanation_ar'];
            $criterion['teacher_edited'] = $criterion['teacher_edited'] || $changed;

            return $criterion;
        })->all();

        $evaluation['released'] = $validated['release'];
        $evaluation['released_at'] = $validated['release']
            ? ($evaluation['released_at'] ?? now()->toIso8601String())
            : $evaluation['released_at'] ?? null;

        $submission->update(['ai_rubric_evaluation' => $evaluation]);

        return response()->json(['success' => true, 'evaluation' => $evaluation]);
    }

    private function authorizeSubmissionAccess(ProjectSubmission $submission)
    {
        $user = Auth::user();
        $teacherModel = $user->teacher;

        if (! $teacherModel) {
            abort(403, __('messages.msg_075'));
        }

        $submission->loadMissing('project');

        return $teacherModel;
    }
}
