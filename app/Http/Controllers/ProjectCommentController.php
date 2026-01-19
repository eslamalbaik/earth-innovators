<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectComment;
use App\Services\CommentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectCommentController extends Controller
{
    public function __construct(
        private CommentService $commentService
    ) {}

    public function store(Request $request, Project $project)
    {
        $user = Auth::user();
        if ($user->isStudent() && $project->school_id !== $user->school_id) {
            return back()->withErrors(['error' => 'غير مصرح لك بالتعليق على هذا المشروع']);
        }

        $request->validate([
            'comment' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:project_comments,id',
            'files' => 'nullable|array',
            'files.*' => 'file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,gif,mp4,avi,mov,zip,rar',
        ], [
            'comment.required' => 'التعليق مطلوب',
            'comment.max' => 'التعليق يجب ألا يتجاوز 2000 حرف',
            'files.*.max' => 'حجم الملف يجب ألا يتجاوز 10 ميجابايت',
        ]);

        try {
            $data = $request->only(['comment', 'parent_id', 'files']);
            if ($request->hasFile('files')) {
                $data['files'] = $request->file('files');
            }

            $this->commentService->createComment($data, $project->id, $user->id);

            return redirect()->back()->with('success', 'تم إضافة التعليق بنجاح!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * تحديث تعليق
     */
    public function update(Request $request, ProjectComment $comment)
    {
        $request->validate([
            'comment' => 'required|string|max:2000',
        ]);

        try {
            $this->commentService->updateComment($comment, $request->only(['comment']), Auth::id());

            return redirect()->back()->with('success', 'تم تحديث التعليق بنجاح!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * حذف تعليق
     */
    public function destroy(ProjectComment $comment)
    {
        try {
            $this->commentService->deleteComment($comment, Auth::id());

            return redirect()->back()->with('success', 'تم حذف التعليق بنجاح!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
