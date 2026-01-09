<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectSubmission;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectSubmissionController extends Controller
{
    public function __construct(
        private SubmissionService $submissionService
    ) {}

    /**
     * تسليم مشروع من قبل طالب
     */
    public function store(Request $request, Project $project)
    {
        $student = Auth::user();

        // Verify project is available for student
        // المشروع يجب أن يكون متاحاً للطالب: إما متاح لجميع المؤسسات تعليمية أو متاح لمدرسة الطالب
        $isAvailableForAllSchools = $project->school_id === null;
        $isAvailableForStudentSchool = $project->school_id === $student->school_id;
        
        if (!$isAvailableForAllSchools && !$isAvailableForStudentSchool) {
            return back()->withErrors(['error' => 'غير مصرح لك بتسليم هذا المشروع']);
        }

        $request->validate([
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar',
            'comment' => 'nullable|string|max:2000',
        ], [
            'files.*.max' => 'حجم الملف يجب ألا يتجاوز 10 ميجابايت',
            'files.*.mimes' => 'نوع الملف غير مدعوم',
            'comment.max' => 'التعليق يجب ألا يتجاوز 2000 حرف',
        ]);

        try {
            $data = $request->only(['files', 'comment']);
            if ($request->hasFile('files')) {
                $data['files'] = $request->file('files');
            }

            $this->submissionService->createSubmission($data, $project->id, $student->id);

            return redirect()->back()->with('success', 'تم تسليم المشروع بنجاح!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * تحديث تسليم مشروع
     */
    public function update(Request $request, ProjectSubmission $submission)
    {
        $request->validate([
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar',
            'comment' => 'nullable|string|max:2000',
        ]);

        try {
            $data = $request->only(['files', 'comment']);
            if ($request->hasFile('files')) {
                $data['files'] = $request->file('files');
            }

            $this->submissionService->updateSubmission($submission, $data, Auth::id());

            return redirect()->back()->with('success', 'تم تحديث التسليم بنجاح!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
