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

    public function store(Request $request, Project $project)
    {
        $student = Auth::user();
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
            $data = [
                'comment' => $request->input('comment'),
            ];
            
            if ($request->hasFile('files')) {
                $data['files'] = $request->file('files');
            } elseif ($request->has('files') && is_array($request->input('files'))) {
                $data['files'] = [];
            } else {
                $data['files'] = [];
            }

            $this->submissionService->createSubmission($data, $project->id, $student->id);

            return redirect()->back()->with('success', 'تم تسليم المشروع بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Project submission error: ' . $e->getMessage(), [
                'project_id' => $project->id,
                'student_id' => $student->id,
                'exception' => $e,
            ]);
            return back()->withErrors(['error' => 'حدث خطأ أثناء تسليم المشروع: ' . $e->getMessage()]);
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
            $data = [
                'comment' => $request->input('comment'),
            ];
            
            if ($request->hasFile('files')) {
                $data['files'] = $request->file('files');
            } elseif ($request->has('files') && is_array($request->input('files'))) {
                $data['files'] = [];
            } else {
                $data['files'] = [];
            }

            $this->submissionService->updateSubmission($submission, $data, Auth::id());

            return redirect()->back()->with('success', 'تم تحديث التسليم بنجاح!');
        } catch (\Exception $e) {
            \Log::error('Project submission update error: ' . $e->getMessage(), [
                'submission_id' => $submission->id,
                'exception' => $e,
            ]);
            return back()->withErrors(['error' => 'حدث خطأ أثناء تحديث التسليم: ' . $e->getMessage()]);
        }
    }
}
