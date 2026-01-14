<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Services\ProjectService;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StudentProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService,
        private SubmissionService $submissionService
    ) {}

    /**
     * عرض المشاريع المعتمدة للطالب
     */
    public function index(Request $request)
    {
        $student = Auth::user();

        if (!$student->school_id) {
            return Inertia::render('Student/Projects/Index', [
                'projects' => [],
                'message' => 'أنت غير مرتبط بمدرسة',
            ]);
        }

        $projects = $this->projectService->getSchoolProjects(
            $student->school_id,
            $request->get('search'),
            'approved',
            $request->get('category'),
            12
        )->withQueryString();

        return Inertia::render('Student/Projects/Index', [
            'projects' => $projects,
        ]);
    }

    /**
     * عرض صفحة رفع مشروع جديد
     */
    public function create()
    {
        $student = Auth::user();

        if (!$student->school_id) {
            return Inertia::render('Student/Projects/Create', [
                'projects' => [],
                'message' => 'أنت غير مرتبط بمدرسة',
            ]);
        }

        // Get available projects for student
        $projects = $this->projectService->getSchoolProjects(
            $student->school_id,
            null,
            'approved',
            null,
            100
        );

        // Get student submissions for evaluation view
        $submissions = $this->submissionService->getStudentSubmissions(
            $student->id,
            null,
            100
        );

        return Inertia::render('Student/Projects/Create', [
            'projects' => $projects->items(),
            'submissions' => $submissions->items(),
        ]);
    }

    /**
     * عرض تفاصيل مشروع مع إمكانية التسليم والتعليق
     */
    public function show(Project $project)
    {
        $student = Auth::user();

        // Verify project is available for student
        // المشروع يجب أن يكون معتمداً وإما:
        // 1. متاح لجميع المؤسسات تعليمية (school_id = null)
        // 2. أو متاح لمدرسة الطالب (school_id = student->school_id)
        $isAvailableForAllSchools = $project->school_id === null;
        $isAvailableForStudentSchool = $project->school_id === $student->school_id;
        
        if ($project->status !== 'approved' || (!$isAvailableForAllSchools && !$isAvailableForStudentSchool)) {
            abort(403, 'غير مصرح لك بعرض هذا المشروع');
        }

        // Increment views
        $project->increment('views');

        // Get project details with optimized query
        $project = $this->projectService->getProjectDetails($project->id, $student);
        
        // Load additional relations
        $project->load([
            'submissions' => function ($query) use ($student) {
                $query->where('student_id', $student->id)->latest();
            },
            'comments' => function ($query) {
                $query->with(['user:id,name,image', 'replies.user:id,name,image'])->latest();
            },
        ]);

        // Get existing submission
        $existingSubmission = $project->submissions
            ->where('student_id', $student->id)
            ->first();

        // Load badges if exists
        if ($existingSubmission && $existingSubmission->badges) {
            $badgeIds = is_array($existingSubmission->badges) 
                ? $existingSubmission->badges 
                : (is_string($existingSubmission->badges) ? json_decode($existingSubmission->badges, true) : []);
            
            if (!empty($badgeIds)) {
                $badges = \App\Models\Badge::whereIn('id', $badgeIds)->get();
                $existingSubmission->badges_data = $badges;
            }
        }

        return Inertia::render('Student/Projects/Show', [
            'project' => $project,
            'existingSubmission' => $existingSubmission,
        ]);
    }
}
