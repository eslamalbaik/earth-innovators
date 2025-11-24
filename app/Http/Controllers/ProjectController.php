<?php

namespace App\Http\Controllers;

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
    public function show(int $id)
    {
        $user = Auth::user();
        
        $project = $this->projectService->getProjectDetails($id, $user);

        if (!$project || $project->status !== 'approved') {
            abort(404, 'المشروع غير موجود أو غير معتمد');
        }

        // للطلاب: التحقق من أن المشروع متاح لمدرستهم
        if ($user && $user->isStudent() && $user->school_id) {
            if ($project->school_id !== $user->school_id) {
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
            'canSubmit' => $user && $user->isStudent() && $project->school_id === $user->school_id,
        ]);
    }
}
