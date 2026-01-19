<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProjectSubmission;
use App\Models\Badge;
use App\Services\SubmissionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AdminSubmissionController extends Controller
{
    public function __construct(
        private SubmissionService $submissionService
    ) {}


    public function show(ProjectSubmission $submission)
    {
        $submission->load(['project', 'student', 'reviewer']);
        $availableBadges = Badge::where('is_active', true)
            ->where('status', 'approved')
            ->get();

        $files = [];
        if ($submission->files && is_array($submission->files)) {
            $files = array_map(function ($file) {
                if (str_starts_with($file, 'http')) {
                    return $file;
                }
                return asset('storage/' . ltrim($file, '/'));
            }, $submission->files);
        }

        return Inertia::render('Admin/Submissions/Show', [
            'submission' => [
                'id' => $submission->id,
                'project' => [
                    'id' => $submission->project->id,
                    'title' => $submission->project->title,
                    'school_id' => $submission->project->school_id,
                    'user' => $submission->project->user ? [
                        'id' => $submission->project->user->id,
                        'role' => $submission->project->user->role,
                    ] : null,
                ],
                'student' => [
                    'id' => $submission->student->id ?? null,
                    'name' => $submission->student->name ?? 'غير معروف',
                    'email' => $submission->student->email ?? '—',
                ],
                'comment' => $submission->comment,
                'files' => $files,
                'status' => $submission->status,
                'rating' => $submission->rating,
                'feedback' => $submission->feedback,
                'badges' => $submission->badges ?? [],
                'reviewer' => $submission->reviewer ? [
                    'id' => $submission->reviewer->id,
                    'name' => $submission->reviewer->name,
                ] : null,
                'submitted_at' => $submission->submitted_at ? $submission->submitted_at->format('Y-m-d H:i') : null,
                'reviewed_at' => $submission->reviewed_at ? $submission->reviewed_at->format('Y-m-d H:i') : null,
            ],
            'availableBadges' => $availableBadges,
        ]);
    }

    public function evaluate(Request $request, ProjectSubmission $submission)
    {
        $request->validate([
            'rating' => 'required|numeric|min:0|max:5',
            'feedback' => 'nullable|string|max:2000',
            'status' => 'required|in:reviewed,approved,rejected',
            'badges' => 'nullable|array',
            'badges.*' => 'exists:badges,id',
        ], [
            'rating.required' => 'التقييم مطلوب',
            'rating.min' => 'التقييم يجب أن يكون بين 0 و 5',
            'rating.max' => 'التقييم يجب أن يكون بين 0 و 5',
            'status.required' => 'الحالة مطلوبة',
        ]);

        try {
            $this->submissionService->evaluateSubmission(
                $submission,
                $request->only(['rating', 'feedback', 'status', 'badges']),
                Auth::id(),
                null,
                null,
                true 
            );

            return redirect()->back()->with('success', 'تم تقييم التسليم بنجاح!');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}

