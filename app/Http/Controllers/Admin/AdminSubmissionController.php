<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProjectSubmission;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSubmissionController extends Controller
{
    public function __construct(
        private SubmissionService $submissionService
    ) {}

    /**
     * عرض جميع تسليمات المشاريع
     */
    public function index(Request $request)
    {
        $submissions = ProjectSubmission::with([
            'project:id,title,status',
            'student:id,name,email',
            'reviewer:id,name'
        ])
            ->select('id', 'project_id', 'student_id', 'files', 'comment', 'status', 'submitted_at', 'reviewed_at', 'rating', 'feedback', 'reviewed_by', 'created_at')
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('status', $request->status);
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($query) use ($search) {
                    $query->whereHas('student', function ($studentQuery) use ($search) {
                        $studentQuery->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('project', function ($projectQuery) use ($search) {
                        $projectQuery->where('title', 'like', "%{$search}%");
                    });
                });
            })
            ->latest('submitted_at')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Admin/Submissions/Index', [
            'submissions' => $submissions,
        ]);
    }

    /**
     * عرض تفاصيل تسليم
     */
    public function show(ProjectSubmission $submission)
    {
        $submission->load(['project', 'student', 'reviewer']);

        return Inertia::render('Admin/Submissions/Show', [
            'submission' => $submission,
        ]);
    }
}
