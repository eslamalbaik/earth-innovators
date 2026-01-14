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

    /**
     * عرض جميع المشاريع المعتمدة (عام - متاح لجميع المستخدمين)
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // عرض جميع المشاريع المعتمدة (المتاحة لجميع المؤسسات تعليمية + المتاحة لمدرسة الطالب إذا كان طالب)
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

        return Inertia::render('Projects/Index', [
            'projects' => $projects,
            'userRole' => $user ? $user->role : null,
        ]);
    }

    /**
     * عرض تفاصيل مشروع معتمد
     */
    public function show($project)
    {
        $user = Auth::user();
        
        // Handle both model binding and ID/string
        if ($project instanceof Project) {
            $projectId = $project->id;
        } elseif (is_numeric($project)) {
            $projectId = (int) $project;
        } else {
            // Try to find project by slug or title
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

        // للطلاب: التحقق من أن المشروع متاح لمدرستهم أو متاح لجميع المؤسسات تعليمية
        if ($user && $user->isStudent() && $user->school_id) {
            $isAvailableForAllSchools = $project->school_id === null;
            $isAvailableForStudentSchool = $project->school_id === $user->school_id;
            
            if (!$isAvailableForAllSchools && !$isAvailableForStudentSchool) {
                abort(403, 'غير مصرح لك بعرض هذا المشروع');
            }
        }

        // Get existing submission if user is student
        $existingSubmission = null;
        if ($user && $user->isStudent() && $project->submissions) {
            $existingSubmission = $project->submissions->first();
            
            // Load badges if they exist
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
