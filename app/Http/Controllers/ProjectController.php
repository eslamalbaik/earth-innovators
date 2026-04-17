<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();

        $search = $request->filled('search') ? trim((string) $request->input('search')) : null;
        $category = $request->filled('category') ? trim((string) $request->input('category')) : null;
        $status = $request->filled('status') ? trim((string) $request->input('status')) : null;
        $viewMode = $this->resolveViewMode($user);

        $projects = match ($viewMode) {
            'teacher' => $this->buildTeacherProjects($user),
            'school' => $this->buildSchoolProjects($user, $search, $status, $category),
            'student' => $this->buildStudentProjects($user, $search, $category),
            'admin' => $this->buildAdminProjects($search, $status, $category),
            default => $this->buildPublicProjects($user, $search, $category),
        };

        $projects->setCollection($this->normalizeProjectAssets($projects->getCollection()));

        $categories = $this->buildProjectCategories();

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'userRole' => $user ? $user->role : null,
            'viewMode' => $viewMode,
            'categories' => $categories,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? '',
                'status' => $status ?? '',
            ],
        ]);
    }


    public function show($project)
    {
        $user = Auth::user();
        
        if ($project instanceof Project) {
            $projectId = $project->id;
        } elseif (is_numeric($project)) {
            $projectId = (int) $project;
        } else {
            $projectModel = Project::where('slug', $project)
                ->orWhere('title', $project)
                ->first();
            
            if (!$projectModel) {
                abort(404, 'المشروع غير موجود');
            }
            
            $projectId = $projectModel->id;
        }
        
        $project = $this->projectService->getProjectDetails($projectId, $user);

        if (!$project || $project->status !== 'approved') {
            abort(404, 'المشروع غير موجود أو غير معتمد');
        }

        if ($user && $user->isStudent() && $user->school_id) {
            $isAvailableForAllSchools = $project->school_id === null;
            $isAvailableForStudentSchool = $project->school_id === $user->school_id;
            
            if (!$isAvailableForAllSchools && !$isAvailableForStudentSchool) {
                abort(403, 'غير مصرح لك بعرض هذا المشروع');
            }
        }

        $existingSubmission = null;
        if ($user && $user->isStudent() && $project->submissions) {
            $existingSubmission = $project->submissions->first();
            
            if ($existingSubmission && $existingSubmission->badges) {
                $badgeIds = is_array($existingSubmission->badges) 
                    ? $existingSubmission->badges 
                    : json_decode($existingSubmission->badges, true) ?? [];
                
                if (!empty($badgeIds)) {
                    $badges = \App\Models\Badge::whereIn('id', $badgeIds)->get();
                    $existingSubmission->badges_data = $badges;
                }
            }
        }

        return Inertia::render('Projects/Show', [
            'project' => $project,
            'existingSubmission' => $existingSubmission,
            'userRole' => $user ? $user->role : null,
            'canSubmit' => $user && $user->isStudent() && ($project->school_id === null || $project->school_id === $user->school_id),
        ]);
    }

    private function resolveViewMode(?User $user): string
    {
        if (!$user) {
            return 'public';
        }

        if (in_array($user->role, ['admin', 'system_supervisor', 'school_support_coordinator'], true)) {
            return 'admin';
        }

        if ($user->isTeacher()) {
            return 'teacher';
        }

        if ($user->isSchool() || $user->isEducationalInstitution()) {
            return 'school';
        }

        if ($user->isStudent()) {
            return 'student';
        }

        return 'public';
    }

    private function buildAdminProjects(?string $search, ?string $status, ?string $category): LengthAwarePaginator
    {
        $query = Project::query()
            ->with([
                'teacher:id,name_ar,user_id',
                'teacher.user:id,name',
                'user:id,name',
                'school:id,name',
                'approver:id,name',
            ])
            ->select('id', 'title', 'description', 'category', 'status', 'teacher_id', 'user_id', 'school_id', 'approved_by', 'views', 'likes', 'rating', 'points_earned', 'images', 'thumbnail', 'project_document', 'created_at')
            ->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($category) {
            $query->where('category', $category);
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate(12)->withQueryString();
    }

    private function buildPublicProjects(?User $user, ?string $search, ?string $category): LengthAwarePaginator
    {
        $schoolId = null;

        if ($user) {
            if ($user->isStudent() && $user->school_id) {
                $schoolId = (int) $user->school_id;
            } elseif ($user->isSchool()) {
                $schoolId = (int) $user->id;
            }
        }

        return $this->projectService->getApprovedProjects(
            $search,
            $category,
            $schoolId,
            12
        )->withQueryString();
    }

    private function buildStudentProjects(User $student, ?string $search, ?string $category): LengthAwarePaginator
    {
        $student->refresh();
        $hasSchool = filled($student->school_id);

        $projects = $this->projectService->getApprovedProjects(
            $search,
            $category,
            $hasSchool ? (int) $student->school_id : null,
            12,
            !$hasSchool
        )->withQueryString();

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
                $submission = $submissions->get($project->id);
                if ($submission) {
                    $project->submission_status = $submission->status;
                    $project->submitted_at = $submission->submitted_at;
                    if ($submission->rating !== null) {
                        $project->rating = (float) $submission->rating;
                    }
                }

                return $project;
            })
        );

        return $projects;
    }

    private function buildTeacherProjects(User $user): LengthAwarePaginator
    {
        $teacher = $user->teacher;
        if (!$teacher) {
            return new LengthAwarePaginator([], 0, 12);
        }

        return $this->projectService->getTeacherProjects($teacher->id, 12)->withQueryString();
    }

    private function buildSchoolProjects(User $user, ?string $search, ?string $status, ?string $category): LengthAwarePaginator
    {
        $schoolId = $user->canAccessAllSchoolData() ? 0 : (int) $user->id;

        return $this->projectService->getSchoolProjects(
            $schoolId,
            $search,
            $status,
            $category,
            12,
            false
        )->withQueryString();
    }

    private function normalizeProjectAssets(Collection $projects): Collection
    {
        return $projects->map(function (Project $project) {
            $normalizePath = static function (?string $path): ?string {
                if (!$path) {
                    return null;
                }

                if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, 'data:')) {
                    return $path;
                }

                if (str_starts_with($path, '/storage/') || str_starts_with($path, '/images/')) {
                    return $path;
                }

                if (str_starts_with($path, 'storage/')) {
                    return '/' . $path;
                }

                return '/storage/' . ltrim($path, '/');
            };

            $images = is_array($project->images) ? $project->images : [];
            $normalizedImages = collect($images)
                ->filter(fn ($image) => is_string($image) && trim($image) !== '')
                ->map(fn ($image) => $normalizePath($image))
                ->values()
                ->all();

            $project->images = $normalizedImages;
            $project->thumbnail = $normalizePath($project->thumbnail);
            $project->project_document = $normalizePath($project->project_document);
            $project->image = $project->thumbnail ?: ($normalizedImages[0] ?? null);

            return $project;
        });
    }

    private function buildProjectCategories()
    {
        return Project::whereNotNull('category')
            ->where('category', '!=', '')
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->map(function ($category) {
                $labels = [
                    'science' => 'علوم',
                    'technology' => 'تقنية',
                    'engineering' => 'هندسة',
                    'mathematics' => 'رياضيات',
                    'arts' => 'فنون',
                    'other' => 'أخرى',
                ];

                return [
                    'value' => $category,
                    'label' => $labels[$category] ?? $category,
                ];
            })
            ->prepend(['value' => '', 'label' => 'الكل']);
    }
}
