<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\User;
use App\Services\ProjectService;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService,
        private SubmissionService $submissionService
    ) {}

    /**
     * عرض المشاريع المعتمدة المتاحة للطالب (مشاريع مدرسته + المشاريع العامة)، مع حالة التسليم
     */
    public function index(Request $request)
    {
        $student = Auth::user();
        if (!$student || !$student->isStudent()) {
            abort(403);
        }

        $student->refresh();
        $hasSchool = filled($student->school_id);

        $approvedProjects = $this->projectService->getApprovedProjects(
            $request->filled('search') ? (string) $request->input('search') : null,
            $request->filled('category') ? (string) $request->input('category') : null,
            $hasSchool ? (int) $student->school_id : null,
            12,
            ! $hasSchool
        )->withQueryString();

        $projects = $this->hydrateApprovedProjectsForStudent($student, $approvedProjects);
        $canStartNewSubmission = $this->studentCanStartNewProjectSubmission($student);

        return Inertia::render('Student/Projects/Index', [
            'projects' => $projects,
            'message' => null,
            'noticeKey' => $hasSchool ? null : 'studentProjects.noSchoolLinked',
            'canStartNewSubmission' => $canStartNewSubmission,
            'auth' => [
                'user' => $student,
            ],
        ]);
    }

    /**
     * عرض صفحة رفع مشروع جديد
     */
    public function create()
    {
        $student = Auth::user();
        if (!$student || !$student->isStudent()) {
            abort(403);
        }

        $student->refresh();
        $hasSchool = filled($student->school_id);

        $projectsPaginator = $this->hydrateApprovedProjectsForStudent(
            $student,
            $this->projectService->getApprovedProjects(
                null,
                null,
                $hasSchool ? (int) $student->school_id : null,
                100,
                ! $hasSchool
            )
        );

        $allVisible = $projectsPaginator->getCollection();
        $submittedIds = ProjectSubmission::where('student_id', $student->id)
            ->whereIn('project_id', $allVisible->pluck('id'))
            ->pluck('project_id');
        $eligibleProjects = $allVisible
            ->filter(fn (Project $p) => ! $submittedIds->contains($p->id))
            ->values()
            ->all();

        $uploadBlockedKey = null;
        if ($eligibleProjects === []) {
            $uploadBlockedKey = Project::approvedVisibleToStudent($student)->exists()
                ? 'studentProjects.upload.allSubmitted'
                : 'studentProjects.upload.noProjectsInCatalog';
        }

        $submissions = $this->submissionService->getStudentSubmissions(
            $student->id,
            null,
            100
        );

        return Inertia::render('Student/Projects/Create', [
            'projects' => $eligibleProjects,
            'submissions' => $submissions->items(),
            'noticeKey' => $hasSchool ? null : 'studentProjects.noSchoolLinked',
            'uploadBlockedKey' => $uploadBlockedKey,
        ]);
    }

    /**
     * يوجد مشروع معتمد يمكن تسليم عمل جديد عليه (لم يُسلَّم بعد).
     */
    private function studentCanStartNewProjectSubmission(User $student): bool
    {
        $submittedIds = ProjectSubmission::where('student_id', $student->id)->pluck('project_id');

        return Project::approvedVisibleToStudent($student)
            ->whereNotIn('id', $submittedIds)
            ->exists();
    }

    /**
     * يربط كل مشروع بحالة تسليم الطالب وصورة مصغرة للقائمة
     */
    private function hydrateApprovedProjectsForStudent(User $student, LengthAwarePaginator $projects): LengthAwarePaginator
    {
        $items = $projects->getCollection();
        $projectIds = $items->pluck('id')->filter()->values();
        $submissions = collect();
        if ($projectIds->isNotEmpty()) {
            $submissions = ProjectSubmission::where('student_id', $student->id)
                ->whereIn('project_id', $projectIds)
                ->get()
                ->keyBy('project_id');
        }

        $projects->setCollection(
            $items->map(function (Project $project) use ($submissions) {
                $sub = $submissions->get($project->id);
                if ($sub) {
                    $project->submission_status = $sub->status;
                    $project->submitted_at = $sub->submitted_at;
                    if ($sub->rating !== null) {
                        $project->rating = (float) $sub->rating;
                    }
                }

                if (is_string($project->thumbnail) && $project->thumbnail !== '') {
                    if (!str_starts_with($project->thumbnail, 'http://') && !str_starts_with($project->thumbnail, 'https://')) {
                        $project->thumbnail = '/storage/' . ltrim($project->thumbnail, '/');
                    }
                }

                if (is_string($project->project_document) && $project->project_document !== '') {
                    if (!str_starts_with($project->project_document, 'http://') && !str_starts_with($project->project_document, 'https://')) {
                        $project->project_document = '/storage/' . ltrim($project->project_document, '/');
                    }
                }

                $images = $project->images ?? [];
                if (!$project->thumbnail && is_array($images) && count($images) > 0) {
                    $first = $images[0];
                    $project->thumbnail = (is_string($first) && (str_starts_with($first, 'http://') || str_starts_with($first, 'https://')))
                        ? $first
                        : '/storage/' . ltrim((string) $first, '/');
                }

                return $project;
            })
        );

        return $projects;
    }

    /**
     * عرض تفاصيل مشروع مع إمكانية التسليم والتعليق
     */
    public function show(Project $project)
    {
        $student = Auth::user();
        $requestedTab = request()->query('tab');
        $backTo = request()->query('from') === 'create'
            ? '/student/projects/create'
            : '/student/projects';

        // المشروع يجب أن يكون معتمداً ومتاحاً للطالب
        $isAvailableForAllSchools  = $project->school_id === null;
        $isAvailableForStudentSchool = $project->school_id === $student->school_id;

        if ($project->status !== 'approved' || (!$isAvailableForAllSchools && !$isAvailableForStudentSchool)) {
            abort(403, 'غير مصرح لك بعرض هذا المشروع');
        }

        // Get project details with optimized query (includes views increment inside the service)
        $projectDetails = $this->projectService->getProjectDetails($project->id, $student);

        if (!$projectDetails) {
            abort(404);
        }

        // Load additional relations not covered by the service
        $projectDetails->load([
            'comments' => function ($query) {
                $query->with(['user:id,name,image', 'replies.user:id,name,image'])->latest();
            },
        ]);

        // Get existing submission
        $existingSubmission = $projectDetails->submissions
            ? $projectDetails->submissions->where('student_id', $student->id)->first()
            : null;

        // Load badges if submission exists
        if ($existingSubmission && $existingSubmission->badges) {
            $badgeIds = is_array($existingSubmission->badges)
                ? $existingSubmission->badges
                : (is_string($existingSubmission->badges) ? json_decode($existingSubmission->badges, true) : []);

            if (!empty($badgeIds)) {
                $badges = \App\Models\Badge::whereIn('id', $badgeIds)->get();
                $existingSubmission->badges_data = $badges;
            }
        }

        if ($existingSubmission && is_array($existingSubmission->files)) {
            $existingSubmission->file_urls = collect($existingSubmission->files)
                ->filter(fn ($path) => is_string($path) && $path !== '')
                ->map(function ($path) {
                    if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
                        return $path;
                    }

                    return '/storage/' . ltrim($path, '/');
                })
                ->values()
                ->all();
        }

        return Inertia::render('Student/Projects/Show', [
            'project'            => $projectDetails,
            'existingSubmission' => $existingSubmission,
            'initialTab'         => in_array($requestedTab, ['details', 'submit', 'comments'], true) ? $requestedTab : 'details',
            'backTo'             => $backTo,
        ]);
    }
}
