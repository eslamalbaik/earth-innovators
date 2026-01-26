<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService
    ) {}

    public function index(Request $request)
    {
        $user = Auth::user();
        
        $schoolId = null;
        if ($user && $user->isStudent() && $user->school_id) {
            $schoolId = $user->school_id;
        }

        $projects = $this->projectService->getApprovedProjects(
            $request->get('search'),
            $request->get('category'),
            $schoolId,
            12
        )->withQueryString();

        // الحصول على الفئات الفريدة من المشاريع المعتمدة
        $categories = Project::where('status', 'approved')
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

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'userRole' => $user ? $user->role : null,
            'categories' => $categories,
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
}
